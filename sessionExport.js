const path = require('path');
const fs = require('fs');
const {spawn} = require('child_process');
const {uploadToS3} = require('./s3');

function waitForFileStable(filePath, maxWait = 30000) {
    return new Promise((resolve, reject) => {
        const startTime = Date.now();
        let lastSize = -1;
        let stableCount = 0;

        const check = () => {
            if (Date.now() - startTime > maxWait) {
                return reject(new Error('Превышено время ожидания файла'));
            }

            if (!fs.existsSync(filePath)) {
                return setTimeout(check, 500);
            }

            const stats = fs.statSync(filePath);
            const currentSize = stats.size;

            if (currentSize === lastSize && currentSize > 0) {
                stableCount++;
                if (stableCount >= 3) { // 3 проверки подряд с одинаковым размером
                    return resolve();
                }
            } else {
                stableCount = 0;
            }

            lastSize = currentSize;
            setTimeout(check, 500);
        };

        check();
    });
}

async function exportSession(sessionId) {
    await new Promise(resolve => setTimeout(resolve, 5000));

    if (!sessionId) throw new Error("Не указан sessionId");

    const bucketName = process.env.S3_BUCKET || "00809bfe-bustmarket-sessions";

    const partitionsRoot = path.join(__dirname, 'sessions');
    const sessionFolder = path.join(partitionsRoot, `session_${sessionId}`, 'Default');

    if (!fs.existsSync(sessionFolder)) {
        throw new Error(`Папка сессии не найдена: ${sessionFolder}`);
    }

    // Определяем что нужно архивировать
    const itemsToArchive = [
        'databases',
        'Local Storage',
        'Network',
        'Session Storage',
        'WebStorage',
        'Preferences'
    ];

    // Проверяем какие элементы существуют
    const existingItems = [];
    for (const item of itemsToArchive) {
        const itemPath = path.join(sessionFolder, item);
        if (fs.existsSync(itemPath)) {
            existingItems.push(item);
        }
    }

    if (existingItems.length === 0) {
        throw new Error('Ни один из нужных элементов не найден в папке сессии');
    }

    const sessionsDir = path.join(__dirname, 'sessions');
    if (!fs.existsSync(sessionsDir)) fs.mkdirSync(sessionsDir, {recursive: true});

    const archivePath = path.join(sessionsDir, `session_${sessionId}.tar.gz`);

    try {
        // Создаем архив только с нужными элементами
        const tarArgs = ['-czf', archivePath, '-C', sessionFolder];
        tarArgs.push(...existingItems);

        spawn('tar', tarArgs);

        // Ждем пока файл создастся и перестанет расти
        await waitForFileStable(archivePath);

        if (!fs.existsSync(archivePath)) {
            throw new Error('Архив не создался');
        }

        const uploadedFile = await uploadToS3(archivePath, bucketName);

        fs.unlinkSync(archivePath);

        return uploadedFile;
    } catch (error) {
        if (fs.existsSync(archivePath)) {
            fs.unlinkSync(archivePath);
        }
        throw error;
    }
}

module.exports = {exportSession};