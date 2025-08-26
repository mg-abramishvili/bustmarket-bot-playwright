const {log} = require("../utils/log");
const getPaymentMethods = require('../requests/getPaymentMethods');
const openPaymentModal = require('../steps/openPaymentModal');
const selectPaymentMethodFromList = require('../steps/selectPaymentMethodFromList');
const goToProfilePage = require('../steps/goToProfilePage');
const goToCart = require('../steps/goToCart');

async function makePayment(page) {
    await log("Отправка запроса на получение способов оплаты");
    const paymentMethods = await getPaymentMethods(page);
    if(!paymentMethods) return false;

    await log("Получение названия способа оплаты");
    const paymentMethodName = paymentMethods[0]?.name;
    if(!paymentMethodName) return false;

    await page.waitForTimeout(5000);

    await log("Выбор способа оплаты СБП");
    const payTextSelector = '.basket-pay__methods';
    const payElement = page.locator(payTextSelector);
    const isVisible = await payElement.isVisible().catch(() => false);

    // Если элемент существует, проверяем его содержимое
    if (isVisible) {
        const payText = await payElement.innerText().catch(() => '');

        if (payText?.includes(paymentMethodName)) {
            return true;
        }
    }

    // Если элемента нет или способ оплаты не выбран, выполняем обычную логику
    let attempts = 0;
    let isPaymentSelected = false;

    while (attempts < 3 && !isPaymentSelected) {
        const isPaymentModalClicked = await openPaymentModal(page);
        if (!isPaymentModalClicked) return false;

        isPaymentSelected = await selectPaymentMethodFromList(page, paymentMethodName);

        if (!isPaymentSelected) {
            // Если из списка пропал СБП метод, уйдем из корзины и вернемся обратно
            const isProfilePageOpened = await goToProfilePage(page);
            if(!isProfilePageOpened) return false;

            await page.waitForTimeout(3000);

            const isReturnedToCart = await goToCart(page);
            if(!isReturnedToCart) return false;

            await page.waitForTimeout(3000);
        }

        attempts++;

        await page.waitForTimeout(3000);
    }

    return isPaymentSelected;
}

module.exports = makePayment;