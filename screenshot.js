const path = require('node:path');
const fs = require('fs');
const {uploadToS3} = require('./s3');

async function captureAndUpload(page, sessionId) {
    if (!page || !sessionId) throw new Error("Не указан win или sessionId");

    // Папка для временных скринов
    const screenshotsDir = path.join(__dirname, "screenshots");
    if (!fs.existsSync(screenshotsDir)) {
        fs.mkdirSync(screenshotsDir, {recursive: true});
    }

    const screenshotPath = path.join(screenshotsDir, `session_${sessionId}.jpg`);

    // Делаем скриншот и сохраняем как jpeg
    await page.screenshot({path: screenshotPath, type: 'jpeg', quality: 80, fullPage: true});

    // Загружаем в S3
    const bucketName = process.env.S3_BUCKET || "00809bfe-bustmarket-sessions-screenshots";

    try {
        const uploadedFile = await uploadToS3(screenshotPath, bucketName);

        // Удаляем локальный файл после загрузки
        fs.unlinkSync(screenshotPath);

        return uploadedFile;
    } catch (err) {
        // В случае ошибки также удаляем локальный файл
        if (fs.existsSync(screenshotPath)) fs.unlinkSync(screenshotPath);
        throw err;
    }
}

module.exports = {captureAndUpload};