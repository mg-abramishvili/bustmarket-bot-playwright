async function goToCart(page) {
    await page.waitForTimeout(2000);

    const selector = '[data-wba-header-name="Cart"]';
    const button = page.locator(selector).first();

    try {
        await button.waitFor({state: "visible"});
        await button.click();

        return true;
    } catch (err) {
        return false;
    }
}

module.exports = goToCart;