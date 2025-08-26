async function confirmAddedSbp(page) {
    await page.waitForTimeout(1000);

    const selector = '.popup-lk-payment .btn-main';
    const button = page.locator(selector).first();

    try {
        await button.waitFor({state: "visible"});
        await button.click();

        return true;
    } catch (err) {
        return false;
    }
}

module.exports = confirmAddedSbp;