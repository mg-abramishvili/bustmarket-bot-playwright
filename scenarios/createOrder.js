const {createLogger} = require("../utils/log");
const {sendOrderDataToServer} = require("../utils/sendToServer");
const checkForAuth = require("../steps/checkForAuth");
const deletePaymentMethods = require("../steps/deletePaymentMethods");
const choosePvz = require("../steps/choosePvz");
const addSbp = require("../steps/addSbp");
const findProduct = require("../steps/findProduct");
const checkCart = require("../steps/checkCart");
const makePayment = require("../steps/makePayment");
const confirmOrder = require("../steps/confirmOrder");
const goToCart = require("../steps/goToCart");
const getCurrentPaymentMethod = require("../steps/getCurrentPaymentMethod");

async function createOrder(page, sessionId, orderId, artnumber, keyword, price, quantity, pvzId, pvzAddress) {
    const log = createLogger(orderId);

    const cancelOrder = async () => {
        await log("Заказ отменён");
        await sendOrderDataToServer(orderId, 'is_cancelled', true);
    };

    const finish = async () => {
        await log("Заказ успешно создан");
        await sendOrderDataToServer(orderId, 'is_created', true);
    };

    await log('Заказ - Проверка на авторизацию');
    const isLoggedIn = await checkForAuth(page);
    if (!isLoggedIn) return await cancelOrder();

    await log('Заказ - Удаление старых способов оплаты из профиля');
    const isOldPaymentMethodsDeleted = await deletePaymentMethods(page);
    if (!isOldPaymentMethodsDeleted) return await cancelOrder();

    await log('Заказ - Добавление СБП');
    const isSbpAdded = await addSbp(page, orderId);
    if (!isSbpAdded) return await cancelOrder();

    await log("Отправка запроса на получение способов оплаты");
    const paymentMethodName = await getCurrentPaymentMethod(page);
    if (!paymentMethodName) return await cancelOrder();

    await sendOrderDataToServer(orderId, 'is_paid', true);

    await log('Заказ - Выбор ПВЗ')
    const isPvzSelected = await choosePvz(page, orderId, pvzId, pvzAddress);
    if (!isPvzSelected) return await cancelOrder();

    await log('Заказ - Поиск товара');
    const isProductFoundAndInCart = await findProduct(page, orderId, artnumber, keyword);
    if (!isProductFoundAndInCart) return await cancelOrder();

    await log('Переход в корзину');
    const isGoToCartClicked = await goToCart(page);
    if (!isGoToCartClicked) return false;

    await log('Заказ - Проверка корзины');
    const isCartChecked = await checkCart(page, orderId, artnumber, quantity);
    if (!isCartChecked) return await cancelOrder();

    // Попытки оплаты и подтверждения заказа
    let isPaymentAndConfirmCompleted = false;
    for (let attempt = 1; attempt <= 10; attempt++) {
        console.log(`Попытка ${attempt} оплаты и подтверждения заказа`);

        isPaymentAndConfirmCompleted = await tryPaymentAndConfirm(page, log, orderId, pvzId, paymentMethodName);
        if (isPaymentAndConfirmCompleted) break;

        console.log(`Попытка ${attempt} не удалась`);

        const isRestarted = await restartPage(page, log);
        if (!isRestarted) {
            console.log("Не удалось перезапустить страницу, отмена заказа");
            break;
        }
    }

    if (!isPaymentAndConfirmCompleted) return await cancelOrder();

    await finish();

    // Отвяжем способ оплаты
    await deletePaymentMethods(page);
}

async function tryPaymentAndConfirm(page, log, orderId, pvzId, paymentMethodName) {
    await log('Заказ - Оплата');
    const isPaymentCompleted = await makePayment(page, orderId, pvzId, paymentMethodName);
    if (!isPaymentCompleted) return false;

    await log('Заказ - Подтверждение заказа');
    const isOrderConfirmed = await confirmOrder(page, orderId);
    if (!isOrderConfirmed) return false;

    return true;
}

async function restartPage(page, log) {
    try {
        await log("Перезагрузка страницы перед повторной попыткой оплаты...");
        await page.reload({waitUntil: 'domcontentloaded'});

        // После перезагрузки нужно убедиться, что мы вернулись в корзину
        const isGoToCartClicked = await goToCart(page);
        if (!isGoToCartClicked) {
            await log("Не удалось вернуться в корзину после перезагрузки");
            return false;
        }

        await page.waitForTimeout(10000); // пауза для стабильности
        await log("Страница успешно перезагружена, готовы к новой попытке оплаты");
        return true;
    } catch (err) {
        await log("Ошибка при перезагрузке страницы: " + err);
        return false;
    }
}

module.exports = createOrder;