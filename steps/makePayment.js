const {createLogger} = require("../utils/log");
const openPaymentModal = require('../steps/openPaymentModal');
const selectPaymentMethodFromList = require('../steps/selectPaymentMethodFromList');
const goToProfilePage = require('../steps/goToProfilePage');
const goToCart = require('../steps/goToCart');

async function makePayment(page, orderId, paymentMethodName) {
    const log = createLogger(orderId);

    // Для теста переопределим название метода оплаты на баланс
    paymentMethodName = "Баланс: 0 ₽";

    // Проверяем, есть ли уже метод оплаты на странице
    if (await isPaymentMethodPresent(page, paymentMethodName)) {
        await log(`Способ оплаты ${paymentMethodName} присутствует на странице`);
        return true;
    }

    const isPaymentMethodsPopupOpened = await openPaymentModal(page);
    if(!isPaymentMethodsPopupOpened) return false;

    const isPaymentMethodSelected = await selectPaymentMethodFromList(page, paymentMethodName);
    if(!isPaymentMethodSelected) return false;

    await page.waitForTimeout(3000);

    if (await isPaymentMethodPresent(page, paymentMethodName)) {
        await log(`Способ оплаты ${paymentMethodName} присутствует на странице`);
        return true;
    }
}

async function isPaymentMethodPresent(page, paymentMethodName) {
    return await page.evaluate((text) => {
        return document.body.innerText.includes(text);
    }, paymentMethodName);
}

module.exports = makePayment;