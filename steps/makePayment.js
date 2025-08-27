const {createLogger} = require("../utils/log");
const openPaymentModal = require('../steps/openPaymentModal');
const selectPaymentMethodFromList = require('../steps/selectPaymentMethodFromList');

async function makePayment(page, orderId, pvzId, paymentMethodName) {
    const log = createLogger(orderId);

    let isPaymentMethodSet = await isPaymentMethodPresent(page, paymentMethodName);

    // Если на странице нет нужного метода оплаты
    if (!isPaymentMethodSet) {
        // Пробуем найти и выбрать его в модалке
        const isChangedViaModal = await changePaymentMethodThroughModal(page, paymentMethodName);
        if(!isChangedViaModal) return false;

        // Если получилось через модалку, проверим наличие на странице еще раз
        isPaymentMethodSet = await isPaymentMethodPresent(page, paymentMethodName);
    }

    if (!isPaymentMethodSet) {
        await log(`Не удалось установить ${paymentMethodName}`);
        return false;
    }

    await log(`Способ оплаты ${paymentMethodName} установлен`);

    return true;
}

async function isPaymentMethodPresent(page, paymentMethodName) {
    return await page.evaluate((text) => {
        return document.body.innerText.includes(text);
    }, paymentMethodName);
}

async function changePaymentMethodThroughModal(page, paymentMethodName) {
    const isPaymentMethodsPopupOpened = await openPaymentModal(page);
    if (!isPaymentMethodsPopupOpened) return false;

    const isPaymentMethodSelected = await selectPaymentMethodFromList(page, paymentMethodName);
    if (!isPaymentMethodSelected) return false;

    await page.waitForTimeout(3000);

    return true;
}

module.exports = makePayment;