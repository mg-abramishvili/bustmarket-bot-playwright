async function confirmOrderButton(page) {
    await page.waitForTimeout(3000);

    const confirmOrderPopup = page.locator('.popup-confirm-order').first();

    if (await confirmOrderPopup.count() > 0) {
        const confirmOrderPopupButton = confirmOrderPopup.locator('.popup__btn-main').first();
        if (await confirmOrderPopupButton.count() === 0) return false;

        await confirmOrderPopupButton.click();
        return true;
    }

    return false;
}

module.exports = confirmOrderButton;