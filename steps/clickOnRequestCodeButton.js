async function clickOnRequestCodeButton(page) {
    await page.waitForTimeout(1000);

    const selector = '#spaAuthForm #requestCode';
    const button = page.locator(selector);

    try {
        await button.waitFor({state: "visible"});

        await button.hover();
        await button.click();

        return true;
    } catch {
        return false;
    }
}

module.exports = clickOnRequestCodeButton;