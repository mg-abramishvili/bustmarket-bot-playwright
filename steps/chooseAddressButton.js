async function chooseAddressButton(page) {
    const selector = '[data-wba-header-name="DLV_Adress"]';
    const button = page.locator(selector).first();

    try {
        await button.waitFor({state: "visible"});
        await button.click();

        return true;
    } catch (err) {
        return false;
    }
}

module.exports = chooseAddressButton;