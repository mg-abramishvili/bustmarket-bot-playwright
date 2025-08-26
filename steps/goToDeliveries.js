async function goToDeliveries(page) {
    await page.waitForTimeout(3000);

    const selectors = [
        '[data-lk-header-wba="LK_DLV"]',
        '[data-wba-header-name="DLV"]'
    ];

    for (const sel of selectors) {
        const button = page.locator(sel).first();
        try {
            await button.waitFor({state: 'visible', timeout: 5000});
            await button.click();
            return true; // кликнули успешно
        } catch (err) {
            // элемент не найден или не видим — пробуем следующий
            continue;
        }
    }

    // ни один элемент не найден или не видим
    return false;
}

module.exports = goToDeliveries;