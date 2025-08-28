async function openLoginForm(page) {
    const button = page.locator('[data-wba-header-name="Login"]').first();

    try {
        await button.waitFor({state: "visible"});
        await button.click();

        return true;
    } catch {
        return false;
    }
}

module.exports = openLoginForm;