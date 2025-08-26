async function goToProfilePage(page) {
    const selector = '[data-wba-header-name="LK"]';
    const button = page.locator(selector).first();

    try {
        await button.waitFor({state: "visible"});
        await button.click({force: true});

        return true;
    } catch (err) {
        return false;
    }
}

module.exports = goToProfilePage;