async function addFundsToBalancePopup(page, paymentMethodName) {
    await page.waitForTimeout(3000);

    const popupSelector = '.popup-replenish-balance';
    const buttonSelector = '.popup__btn-main';

    const popup = page.locator(popupSelector).first();

    try {
        // Ждем, что попап видим
        await popup.waitFor({state: 'visible'});

        // Проверяем, что внутри есть нужный paymentMethodName
        const hasPaymentMethod = await popup.locator(`text=${paymentMethodName}`).count();
        if (hasPaymentMethod === 0) return false;

        // Кликаем по кнопке
        const button = popup.locator(buttonSelector).first();
        await button.click();

        return true;
    } catch (err) {
        return false;
    }
}

module.exports = addFundsToBalancePopup;