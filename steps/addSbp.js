const {createLogger} = require('../utils/log');
const clickToOpenPaymentMethodsPopup = require('../steps/clickToOpenPaymentMethodsPopup');
const clickToAddQrCode = require('../steps/clickToAddQrCode');
const waitingForQrSbp = require('../steps/waitingForQrSbp');
const confirmAddedSbp = require('../steps/confirmAddedSbp');

async function addSbp(page, orderId)  {
    const log = createLogger(orderId);

    // Пауза
    await page.waitForTimeout(5000);

    await log("Открытие окна способов оплаты");
    const isPaymentMethodsPopupClicked = await clickToOpenPaymentMethodsPopup(page);
    if(!isPaymentMethodsPopupClicked) return false;

    await log("Нажатие на кнопку привязки СБП");
    const isAddQrCodeClicked = await clickToAddQrCode(page);
    if(!isAddQrCodeClicked) return false;

    await log("Ожидание привязки СБП");
    const isSbpAdded = await waitingForQrSbp(page, orderId);
    if(!isSbpAdded) return false;

    const isSbpConfirmed = await confirmAddedSbp(page);
    if(!isSbpConfirmed) return false;

    return true;
}

module.exports = addSbp;