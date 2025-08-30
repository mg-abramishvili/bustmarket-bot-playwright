async function selectPvzFromList(page, pvzAddress, address, mode) {
    await page.waitForTimeout(2000);

    if (!address.street) return false;
    if (!address.home) return false;

    try {
        // Ждем открытия попапа
        const popup = page.locator('.popup').first();
        await popup.waitFor({state: 'visible'});
        await page.waitForTimeout(1000);

        let tabButton;

        // Нажатие таба Пункт выдачи если pvz или Курьером если dbs
        if (mode === 'dbs') {
            tabButton = page.locator(`text=курьером`).first();
        } else {
            tabButton = page.locator(`text=пункт выдачи`).first();
        }

        await tabButton.waitFor({state: 'visible'});
        await tabButton.click();

        await page.waitForTimeout(2000);

        // Выбор адреса из списка
        let addressItemButton;

        if (mode === 'dbs') {
            // Находим все элементы с улицей
            const streetElements = popup.locator(`text=${address.street}`);
            await streetElements.waitFor({state: 'visible'});
            const count = await streetElements.count();

            // Перебираем их и ищем тот, что содержит дом
            for (let i = 0; i < count; i++) {
                const element = streetElements.nth(i);
                const text = await element.textContent();
                if (text.includes(address.home)) {
                    addressItemButton = element;
                    break;
                }
            }
        } else {
            // Поиск по pvzAddress
            addressItemButton = popup.locator(`text=${pvzAddress}`).first();
        }

        await addressItemButton.waitFor({state: 'visible'});
        await addressItemButton.click();

        await page.waitForTimeout(2000);

        // Кнопка подтверждения
        const confirmButtonSelector = '.popup button.btn-main';
        let confirmButton;

        if (mode === 'dbs') {
            confirmButton = page.locator(confirmButtonSelector).last();
        } else {
            confirmButton = page.locator(confirmButtonSelector).first();
        }

        await confirmButton.waitFor({state: 'visible'});
        await confirmButton.click();

        return true;
    } catch (err) {
        return false;
    }
}

module.exports = selectPvzFromList;
