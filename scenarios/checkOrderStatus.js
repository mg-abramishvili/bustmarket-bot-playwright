const {createLogger} = require("../utils/log");
const {sendOrderDataToServer} = require("../utils/sendToServer");
const checkForAuth = require("../steps/checkForAuth");
const goToDeliveries = require("../steps/goToDeliveries");

async function checkOrderStatus(page, sessionId, orderId, artnumber) {
    const log = createLogger(orderId);

    const status = {
        status_text: '',
        receive_code: '',
        is_received: false
    };

    const finish = async () => {
        await sendOrderDataToServer(orderId, 'order_status', status);
    };

    try {
        await log('Проверка на авторизацию');
        const isLoggedIn = await checkForAuth(page);
        if (!isLoggedIn) return await finish();

        await page.waitForTimeout(3000);

        await log('Переход в доставки');
        const isDeliveriesOpened = await goToDeliveries(page);
        if (!isDeliveriesOpened) return await finish();

        await log('Ожидание запросов orders, delivery/active и last-status');

        const responses = {
            orders: null,
            deliveryActive: null,
            lastStatus: null
        };

        // Следим за запросами с информацией о заказах
        const timeout = 30000;
        const start = Date.now();

        page.on('response', async (res) => {
            try {
                const url = res.url();
                if (url.includes("orders") && res.request().method() === "GET") {
                    responses.orders = await res.json();
                } else if (url.includes("myorders/delivery/active") && res.request().method() === "POST") {
                    responses.deliveryActive = await res.json();
                } else if (url.includes("last-status") && res.request().method() === "POST") {
                    responses.lastStatus = await res.json();
                }
            } catch (e) {
                //
            }
        });

        // Ждём пока все ответы получены или таймаут
        while ((!responses.orders || !responses.deliveryActive || !responses.lastStatus) && (Date.now() - start) < timeout) {
            await page.waitForTimeout(500);
        }

        if (!responses.orders && !responses.deliveryActive && !responses.lastStatus) {
            await log('Не удалось получить ответы от сервера');
            return await finish();
        }

        await log('Поиск uid/rid в ответах запросов');

        let uidrid = null;
        let statusText = null;

        // Поиск uid/rid в ответе orders
        if (responses.orders?.data?.length) {
            responses.orders.data.forEach(order => {
                if (order.rids && order.rids.length > 0) {
                    order.rids.forEach(rid => {
                        if (rid.nm_id == artnumber) uidrid = rid.uid;
                    });
                }
            });
        }

        // Поиск uid/rid в ответе delivery/active
        if (responses.deliveryActive?.value?.positions?.length > 0) {
            responses.deliveryActive.value.positions.forEach(position => {
                if (position.code1S == artnumber) uidrid = position.rId;
            });
        }

        // Если запись не нашли, считаем заказ доставленным
        if (!uidrid) {
            await log('Заказ доставлен');
            status.is_received = true;
        }

        // Если нашли запись - считаем что заказ в пути, забираем статус
        if (uidrid) {
            console.log(uidrid)
            await log('Поиск статуса в ответе last-status');

            if (responses.lastStatus?.length) {
                responses.lastStatus.forEach(item => {
                    if (item.rid === uidrid) statusText = item.status_name;
                });
            }

            if (statusText) {
                await log(`Статус: ${statusText}`);
                status.status_text = statusText;
            }
        }

        await log('Поиск кода получения');
        const deliveryCodeSelector = page.locator('.delivery-code__value').first();

        await deliveryCodeSelector.waitFor({state: "visible"});
        const deliveryCode = await deliveryCodeSelector.textContent();
        await log(`Код получения - ${deliveryCode?.trim() || ''}`);

        status.receive_code = deliveryCode?.trim() || '';

        // Пауза
        await page.waitForTimeout(2000);

        // Завершим работу
        await finish();
    } catch (error) {
        return await finish();
    }
}

module.exports = checkOrderStatus;
