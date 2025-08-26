async function selectPaymentMethodFromList(page, paymentMethodName) {
    await page.waitForTimeout(2000);

    try {
        // Ждем открытия попапа
        const popup = page.locator('.popup');
        await popup.waitFor({state: 'visible'});
        await page.waitForTimeout(1000);

        // Выбор адреса из списка
        const addressItemButton = popup.locator(`text=${paymentMethodName}`);
        await addressItemButton.waitFor({state: 'visible'});
        await addressItemButton.click();
        await page.waitForTimeout(1000);

        // Кнопка подтверждения
        const confirmButton = page.locator('.popup-choose-pay .popup__btn-main').first();
        await confirmButton.waitFor({state: 'visible'});
        await confirmButton.click();

        return true;
    } catch (err) {
        return false;
    }
}

module.exports = selectPaymentMethodFromList;
