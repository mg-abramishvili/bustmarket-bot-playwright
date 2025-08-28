async function checkForAuth(page) {
    const lkButtonSelector = '[data-wba-header-name="LK"]';

    try {
        const lkButton = page.locator(lkButtonSelector).first();
        await lkButton.waitFor({state: 'visible'});
        return true;
    } catch (err) {
        return false;
    }
}

module.exports = checkForAuth;