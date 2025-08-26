const clickToOpenPaymentMethodsPopup = require('../steps/clickToOpenPaymentMethodsPopup');
const clickToAddQrCode = require('../steps/clickToAddQrCode');
const waitingForQrSbp = require('../steps/waitingForQrSbp');
const confirmAddedSbp = require('../steps/confirmAddedSbp');

async function addSbp(page)  {
    await page.waitForTimeout(5000);

    // Открытие окна способов оплаты
    const isPaymentMethodsPopupClicked = await clickToOpenPaymentMethodsPopup(page);
    if(!isPaymentMethodsPopupClicked) return false;

    // Пауза
    await page.waitForTimeout(2000);

    // Нажатие на кнопку привязки СБП
    const isAddQrCodeClicked = await clickToAddQrCode(page);
    if(!isAddQrCodeClicked) return false;

    // Ожидание привязки СБП
    const isSbpAdded = await waitingForQrSbp(page);
    if(!isSbpAdded) return false;

    const isSbpConfirmed = await confirmAddedSbp(page);
    if(!isSbpConfirmed) return false;

    return true;
}

module.exports = addSbp;