async function checkForSizes(page) {
    await page.waitForTimeout(3000);

    const sizesList = page.locator('ul[class^="sizesList"], ul[class*="sizes-list"]').last();

    try {
        await sizesList.waitFor({state: "visible", timeout: 5000});

        try {
            await sizesList.locator('button').first().click({timeout: 3000});
        } catch (buttonError) {
            await sizesList.locator('label').first().click({timeout: 3000});
        }

        return true;
    } catch (e) {
        return false;
    }
}

module.exports = checkForSizes;