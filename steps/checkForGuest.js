async function checkForAuth(page) {
    const loginButtonSelector = '[data-wba-header-name="Login"]';

    try {
        const loginButton = page.locator(loginButtonSelector).first();
        await loginButton.waitFor({state: 'visible'});
        return true;
    } catch (err) {
        return false;
    }
}

module.exports = checkForAuth;