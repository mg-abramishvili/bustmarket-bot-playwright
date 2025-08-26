const {log, setOrderId} = require("../utils/log");
const {sendOrderDataToServer} = require("../utils/sendToServer");
const checkForAuth = require("../steps/checkForAuth");
const goToDeliveries = require("../steps/goToDeliveries");

async function checkOrderStatus(page, sessionId, orderId, artnumber) {
    const status = {
        status_text: '',
        receive_code: '',
        is_received: false
    };

    try {
        // Установим ID заказа
        await setOrderId(orderId);

        await log('Проверка на авторизацию');
        const isLoggedIn = await checkForAuth(page);
        if (!isLoggedIn) return await cancelOrderStatusCheck();

        await log('Переход в доставки');
        const isDeliveriesOpened = await goToDeliveries(page);
        if (!isDeliveriesOpened) return await cancelOrderStatusCheck();

        await log('Проверка наличия заказа');
        const orderBlockSelector = page.locator('.delivery-block--delivery').first();

        try {
            await orderBlockSelector.waitFor({state: "visible", timeout: 5000});

            // Если блок есть, товар еще в пути
            await log('Проверка артикула по URL фото');
            const productPhotoImgSelector = '.product__photo img';
            const productPhotoElement = await page.$(productPhotoImgSelector);
            if (!productPhotoElement) return await cancelOrderStatusCheck();

            const productPhotoSrc = await productPhotoElement.getAttribute('src');
            if (!productPhotoSrc || !productPhotoSrc.includes(artnumber)) {
                return await cancelOrderStatusCheck();
            }

            await log('Проверка статуса');
            const orderStatusSelector = page.locator('.product__price-status').first();

            try {
                await orderStatusSelector.waitFor({state: "visible", timeout: 5000});
                const orderStatusText = await orderStatusSelector.textContent();

                if (!orderStatusText?.trim()) {
                    return await cancelOrderStatusCheck();
                }

                await log(`Статус заказа - ${orderStatusText.trim()}`);

                await log('Поиск кода получения');
                const deliveryCodeSelector = page.locator('.delivery-code__value').first();

                try {
                    await deliveryCodeSelector.waitFor({state: "visible", timeout: 5000});
                    const deliveryCode = await deliveryCodeSelector.textContent();
                    await log(`Код получения - ${deliveryCode?.trim() || ''}`);

                    status.status_text = orderStatusText.trim();
                    status.receive_code = deliveryCode?.trim() || '';
                } catch (error) {
                    await log('Код получения не найден');
                    return await cancelOrderStatusCheck();
                }
            } catch (error) {
                await log('Статус заказа не найден');
                return await cancelOrderStatusCheck();
            }
        } catch (error) {
            // Если блока нет, считаем что товар получен
            await log('Блок доставки не найден, товар получен');
            status.is_received = true;
        }

        // Пауза
        await page.waitForTimeout(2000);

        // Отправим данные на сервер
        await sendOrderDataToServer(orderId, 'order_status', status);

        // Завершим работу
        await finish();
    } catch (error) {
        return await cancelOrderStatusCheck();
    }
}

async function cancelOrderStatusCheck() {
    //
}

async function finish() {
    //
}

module.exports = checkOrderStatus;