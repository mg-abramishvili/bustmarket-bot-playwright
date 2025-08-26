async function addToCart(page) {
    await page.waitForTimeout(3000);

    try {
        // Варианты кнопок
        const labels = ['Добавить в корзину', 'Перейти в корзину'];

        // Сначала ищем кнопки по aria-label
        for (const label of labels) {
            const button = page.getByRole('button', {name: label}).first();
            try {
                await button.waitFor({state: 'visible', timeout: 5000});
                await button.click();
                return true;
            } catch {
                continue; // кнопка не найдена или невидима
            }
        }

        // Если кнопки не нашли, ищем ссылку <a> с href=/lk/basket
        const basketLink = page.locator('a[href*="/lk/basket"]').first();
        try {
            await basketLink.waitFor({state: 'visible', timeout: 5000});
            await basketLink.click();
            return true;
        } catch {
            return false; // ни кнопки, ни ссылки нет
        }

    } catch (err) {
        console.error('Не удалось кликнуть корзину:', err);
        return false;
    }
}

module.exports = addToCart;
