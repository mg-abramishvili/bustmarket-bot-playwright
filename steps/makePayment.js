const getPaymentMethods = require('../requests/getPaymentMethods');
const openPaymentModal = require('../steps/openPaymentModal');
const selectPaymentMethodFromList = require('../steps/selectPaymentMethodFromList');
const goToProfilePage = require('../steps/goToProfilePage');
const goToCart = require('../steps/goToCart');

async function makePayment(page) {
    const paymentMethods = await getPaymentMethods(page);
    if(!paymentMethods) return false;

    const paymentMethodName = paymentMethods[0]?.name;
    if(!paymentMethodName) return false;

    await page.waitForTimeout(5000);

    const payTextSelector = '.basket-pay__methods';
    const payElement = page.locator(payTextSelector);
    const isVisible = await payElement.isVisible().catch(() => false);

    // Если элемент существует, проверяем его содержимое
    if (isVisible) {
        console.log(payTextSelector + ' here');
        const payText = await payElement.innerText().catch(() => '');

        console.log(payText);
        console.log(paymentMethodName);

        if (payText?.includes(paymentMethodName)) {
            console.log('Payment method already selected');
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