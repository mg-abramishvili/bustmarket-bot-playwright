async function clickToAddQrCode(page) {
    await page.waitForTimeout(1000);

    const text = 'Привязать счёт СБП';
    const container = '.popup';

    try {
        const popup = page.locator(container);
        await popup.waitFor({state: 'visible'});

        const button = popup.locator(`text=${text}`);
        await button.waitFor({state: 'visible'});

        await button.click();
        return true;
    } catch (err) {
        return false;
    }
}

module.exports = clickToAddQrCode;
