const {createLogger} = require('../utils/log');
const clickOnOrderButton = require('../steps/clickOnOrderButton');
const selectPayNowTab = require('../steps/selectPayNowTab');
const checkForOrderConfirmedMessage = require('../steps/checkForOrderConfirmedMessage');
const confirmOrderFinal = require('../steps/confirmOrderFinal');

async function confirmOrder(page, orderId) {
    const log = createLogger(orderId);

    // Пауза
    await page.waitForTimeout(3000);

    await log("Попытка переключения на оплату сразу");
    await selectPayNowTab(page);

    await log("Нажатие на кнопку Заказать");
    const isOrderButtonClicked = await clickOnOrderButton(page);
    if (!isOrderButtonClicked) return false;

    await log("Поиск окна с кнопкой подтверждения");
    await confirmOrderFinal(page);

    await log("Поиск сообщения об успешном заказе");
    const isOrderConfirmedMessageExist = await checkForOrderConfirmedMessage(page);
    if(!isOrderConfirmedMessageExist) return false;

    return true;
}

module.exports = confirmOrder;