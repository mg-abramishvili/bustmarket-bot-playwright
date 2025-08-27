async function clickOnOrderButton(page) {
    const selector = '.j-btn-confirm-order';
    const button = page.locator(selector).first();

    try {
        await button.waitFor({state: "visible"});
        await button.click();

        return true;
    } catch (err) {
        return false;
    }
}

module.exports = clickOnOrderButton;