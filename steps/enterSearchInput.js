async function enterSearchInput(page, artnumber, keyword) {
    // Базовый селектор
    const searchInput = page.locator('#searchInput').first();

    try {
        await searchInput.waitFor({state: "visible"});

        // Чистим поле и вводим значение
        const value = keyword ?? String(artnumber);
        await searchInput.fill(value);

        // Нажимаем Enter
        await searchInput.press('Enter');

        return true;
    } catch (err) {
        return false;
    }
}

module.exports = enterSearchInput;