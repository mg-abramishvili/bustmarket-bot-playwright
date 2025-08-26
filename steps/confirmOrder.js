const clickOnOrderButton = require('../steps/clickOnOrderButton');
const selectPayNowTab = require('../steps/selectPayNowTab');
const checkForOrderConfirmedMessage = require('../steps/checkForOrderConfirmedMessage');
const confirmOrderFinal = require('../steps/confirmOrderFinal');

async function confirmOrder(page) {
    await page.waitForTimeout(3000);

    // const isPayNowTabSelected = await selectPayNowTab(page);
    // if (!isPayNowTabSelected) return false;

    const isOrderButtonClicked = await clickOnOrderButton(page);
    if (!isOrderButtonClicked) return false;

    await confirmOrderFinal(page);

    const isOrderConfirmedMessageExist = await checkForOrderConfirmedMessage(page);
    if(!isOrderConfirmedMessageExist) return false;

    return true;
}

module.exports = confirmOrder;