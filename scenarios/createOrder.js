const {log} = require("../utils/log");
const checkForAuth = require("../steps/checkForAuth");
const deletePaymentMethods = require("../steps/deletePaymentMethods");
const choosePvz = require("../steps/choosePvz");
const addSbp = require("../steps/addSbp");
const findProduct = require("../steps/findProduct");
const checkCart = require("../steps/checkCart");
const makePayment = require("../steps/makePayment");
const confirmOrder = require("../steps/confirmOrder");

async function createOrder(page, sessionId, orderId, artnumber, keyword, price, quantity, pvzId, pvzAddress) {
    await log('Этап - Проверка на авторизацию');
    const isLoggedIn = await checkForAuth(page);
    if (!isLoggedIn) return await cancelOrder();

    // await log('Этап - Удаление старых способов оплаты из профиля');
    // const isOldPaymentMethodsDeleted = await deletePaymentMethods(page);
    // if(!isOldPaymentMethodsDeleted) return await cancelOrder();
    //
    // await log('Этап - Добавление СБП');
    // const isSbpAdded = await addSbp(page);
    // if (!isSbpAdded) return await cancelOrder();
    //
    // await log('Этап - Выбор ПВЗ');
    // const isPvzSelected = await choosePvz(page, pvzId, pvzAddress);
    // if (!isPvzSelected) return await cancelOrder();

    await log('Этап - Поиск товара, в корзину');
    const isProductFoundAndInCart = await findProduct(page, artnumber, keyword);
    if (!isProductFoundAndInCart) return await cancelOrder();

    await log('Этап - Проверка корзины');
    const isCartChecked = await checkCart(page, artnumber, quantity);
    if (!isCartChecked) return await cancelOrder();

    await log('Этап - Оплата');
    const isPaymentCompleted = await makePayment(page);
    if (!isPaymentCompleted) return await cancelOrder();

    await log('Этап - Подтверждение заказа');
    const isOrderConfirmed = await confirmOrder(page);
    if (!isOrderConfirmed) return await cancelOrder();

    await page.waitForTimeout(50000);
}

async function cancelOrder() {

}

async function finish() {

}

module.exports = createOrder;