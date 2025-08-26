const {createLogger} = require('../utils/log');

async function checkCart(page, orderId, artnumber, quantity) {
    const log = createLogger(orderId);

    await page.waitForTimeout(3000);

    const basketItemsSelector = '.basket-list .j-b-basket-item';

    try {
        const basketItemsLocator = page.locator(basketItemsSelector);

        // Ждём хотя бы один элемент корзины
        await basketItemsLocator.first().waitFor({state: 'attached'});

        let count = await basketItemsLocator.count();

        for (let i = 0; i < count; i++) {
            const item = basketItemsLocator.nth(i);

            // Ищем ссылку внутри товара
            const link = item.locator('a');
            if ((await link.count()) === 0) continue;

            const href = await link.first().getAttribute('href') || '';
            const hasArtNumber = href.includes(artnumber);

            // Удаляем лишние позиции
            if (!hasArtNumber) {
                const deleteButton = item.locator('.j-basket-item-del');
                if ((await deleteButton.count()) > 0) {
                    await deleteButton.first().click();
                    await page.waitForTimeout(1000);
                }
                // Обновляем количество элементов и начинаем цикл заново
                count = await basketItemsLocator.count();
                i = -1;
            }
        }

        await page.waitForTimeout(1000);

        // Теперь находим нужный элемент корзины с артикулом
        const targetItem = basketItemsLocator.filter({
            has: page.locator(`a[href*="${artnumber}"]`)
        }).first();

        if ((await targetItem.count()) === 0) return false;

        // Находим input для количества
        const quantityInput = targetItem.locator('input[type=number]').first();
        if ((await quantityInput.count()) === 0) return false;

        // Устанавливаем значение количества
        await quantityInput.fill(String(quantity));

        await page.waitForTimeout(1000);
        await quantityInput.dispatchEvent('input');
        await quantityInput.dispatchEvent('change');

        return true;
    } catch (err) {
        return false;
    }
}

module.exports = checkCart;
