async function selectPayNowTab(page) {
    const payNowTabs = page.locator('.basket-order__tabs-switch .tabs-switch__item');

    // Проверяем, есть ли хотя бы 2 вкладки
    const count = await payNowTabs.count();
    if (count >= 2) {
        const payNowButton = payNowTabs.nth(1).locator('button');
        if (await payNowButton.count() === 0) return false;

        await payNowButton.click();
        return true;
    }

    return false;
}

module.exports = selectPayNowTab;