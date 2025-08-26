async function waitingForQrSbp(page, orderId) {
    try {
        // Ждём появления QR
        const sbpQr = page.locator('.popup-qrc__value svg').first();
        await sbpQr.waitFor({state: 'visible'});

        // Пауза для стабилизации
        await page.waitForTimeout(1000);

        // Отправка QR на сервер
        // const qrSvg = await sbpQr.evaluate(el => el.outerHTML);
        // await sendOrderDataToServer(orderId, 'qr_image', qrSvg);

        // Ждём исчезновения QR-кода (успешная привязка)
        const timeout = 290  * 1000; // 3 мин 50 сек
        await sbpQr.waitFor({state: 'detached', timeout: timeout});

        // После исчезновения попапа
        await page.waitForTimeout(3000);
        return true;
    } catch (err) {
        return false;
    }
}

module.exports = waitingForQrSbp;
