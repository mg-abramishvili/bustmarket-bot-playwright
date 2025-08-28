async function enterSms(page, sms) {
    const input = page.locator('#spaAuthForm input[inputmode=numeric]').first();

    try {
        await input.waitFor({state: "visible"});
        await input.focus();

        // Пауза
        await new Promise(r => setTimeout(r, 1000));

        for (const char of sms) {
            await page.keyboard.type(char, {delay: 600});
        }

        return true;
    } catch {
        return false;
    }
}

module.exports = enterSms;