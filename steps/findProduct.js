const {createLogger} = require('../utils/log');
const enterSearchInput = require('../steps/enterSearchInput');
const addToCart = require('../steps/addToCart');
const checkForSizes = require('../steps/checkForSizes');
const goToCart = require('../steps/goToCart');

async function findProduct(page, orderId, artnumber, keyword) {
    const log = createLogger(orderId);

    await log('Ввод ключевого слова или артикул в поиск');
    const isSearchInputEntered = await enterSearchInput(page, artnumber, keyword);
    if (!isSearchInputEntered) return false;

    await log('Добавление товара в корзину');
    const isAddToCartClicked = await addToCart(page);
    if (!isAddToCartClicked) return false;

    await log('Проверка наличия у товара размеров');
    const isSizesListChecked = await checkForSizes(page);

    await log('Переход в корзину');
    const isGoToCartClicked = await goToCart(page);
    if (!isGoToCartClicked) return false;

    return true;
}

module.exports = findProduct;