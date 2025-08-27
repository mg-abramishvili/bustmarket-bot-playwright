async function clickToOpenPaymentMethodsPopup(page) {
    // Наведение на дропдаун "Профиль" чтобы подгрузилось меню
    const lkLinkSelector = '[data-wba-header-name="LK"]';
    const lkLink = page.locator(lkLinkSelector).first();

    try {
        await lkLink.waitFor({state: 'visible'});
        await lkLink.hover();

        await page.waitForTimeout(1000);

        // Поиск кнопки "Способы оплаты" и клик
        const selector = '[data-wba-header-name="My_Cards"]';
        const button = page.locator(selector);

        await button.waitFor({state: 'visible'});
        await button.click();

        return true;
    } catch (err) {
        return false;
    }
}

module.exports = clickToOpenPaymentMethodsPopup;