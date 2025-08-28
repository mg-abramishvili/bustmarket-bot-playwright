async function enterPhoneNumber(page, phoneNumber) {
    await page.waitForTimeout(2000);

    const loginPhoneInput = page.locator('#spaAuthForm input[inputmode="tel"]');

    try {
        await loginPhoneInput.waitFor({state: 'visible'});

        await loginPhoneInput.fill('');
        await loginPhoneInput.focus();

        await page.waitForTimeout(1000);

        for (const char of phoneNumber) {
            await page.keyboard.type(char, {delay: 600});
        }

        await page.waitForTimeout(1000);
        return true;
    } catch {
        return false;
    }
}

module.exports = enterPhoneNumber;