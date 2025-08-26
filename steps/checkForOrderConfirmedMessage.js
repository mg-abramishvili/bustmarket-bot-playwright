async function checkForOrderConfirmedMessage(page) {
    await page.waitForTimeout(3000);

    const selector = '.order-confirmed';
    const button = page.locator(selector).first();

    try {
        await button.waitFor({state: "visible"});
        return true;
    } catch (err) {
        return false;
    }
}

module.exports = checkForOrderConfirmedMessage;