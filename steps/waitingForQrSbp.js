const {createLogger} = require('../utils/log');
const {svgStringToPngBase64} = require('../utils/svg');
const {sendOrderDataToServer} = require('../utils/sendToServer');

async function waitingForQrSbp(page, orderId) {
    const log = createLogger(orderId);

    try {
        // Ждём появления QR
        const sbpQr = page.locator('.popup-lk-payment svg').first();
        await sbpQr.waitFor({state: 'visible'});

        await log('Конвертация QR SVG в PNG base64')
        const qrPngBase64 = await svgStringToPngBase64(page);

        // Отправка QR на сервер
        if(qrPngBase64) await sendOrderDataToServer(orderId, 'qr_image', qrPngBase64);
        await log("QR отправлен на сервер");

        // Ждём исчезновения QR-кода (успешная привязка)
        const timeout = 230  * 1000; // 3 мин 50 сек
        await sbpQr.waitFor({state: 'detached', timeout: timeout});

        // После исчезновения попапа
        await page.waitForTimeout(3000);
        return true;
    } catch (err) {
        return false;
    }
}

module.exports = waitingForQrSbp;
