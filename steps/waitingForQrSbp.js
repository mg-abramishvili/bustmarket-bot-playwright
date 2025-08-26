const {log} = require('../utils/log');
const {svgStringToPngBase64} = require('../utils/svg');
const {sendOrderDataToServer} = require('../utils/sendToServer');

async function waitingForQrSbp(page, orderId) {
    try {
        // Ждём появления QR
        const sbpQr = page.locator('.popup-qrc__value svg').first();
        await sbpQr.waitFor({state: 'visible'});

        // Пауза для стабилизации
        await page.waitForTimeout(1000);

        await log('Конвертация QR SVG в PNG base64')
        const qrSvg = await sbpQr.evaluate(el => el.outerHTML);
        const qrPngBase64 = await svgStringToPngBase64(qrSvg);

        // Отправка QR на сервер
        if(qrPngBase64) {
            await sendOrderDataToServer(orderId, 'qr_image', qrPngBase64);
        }

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
