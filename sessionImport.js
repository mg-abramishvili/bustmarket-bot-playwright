const fs = require('fs');
const path = require('path');
const {spawn} = require('child_process');

async function waitForFileSystem(dirPath, maxAttempts = 10, delay = 500) {
    const defaultPath = path.join(dirPath, 'Default');
    for (let i = 0; i < maxAttempts; i++) {
        try {
            const stats = fs.statSync(defaultPath);
            if (stats.isDirectory()) {
                const files = fs.readdirSync(defaultPath);
                const hasSessionFiles = files.some(file =>
                    file.includes('Local Storage') || file.includes('Session Storage')
                );
                if (hasSessionFiles) return true;
            }
        } catch (err) {}
        await new Promise(resolve => setTimeout(resolve, delay));
    }
    throw new Error(`Сессия не готова за ${maxAttempts * delay}мс`);
}

async function importSession(sessionId) {
    const url = `https://s3.twcstorage.ru/00809bfe-bustmarket-sessions/session_${sessionId}.tar.gz`;

    // Скачиваем файл
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Ошибка скачивания сессии: ${response.statusText}`);

    const buffer = Buffer.from(await response.arrayBuffer());
    const tmpPath = path.join(__dirname, `tmp_${sessionId}.tar.gz`);
    fs.writeFileSync(tmpPath, buffer);

    const extractPath = path.join(__dirname, 'sessions', `session_${sessionId}`);

    if (fs.existsSync(extractPath)) {
        fs.rmSync(extractPath, {recursive: true, force: true});

        await new Promise(resolve => setTimeout(resolve, 3000));
    }

    const fullExtractPath = path.join(__dirname, 'sessions', `session_${sessionId}`, 'Default');
    fs.mkdirSync(fullExtractPath, {recursive: true});

    await new Promise((resolve, reject) => {
        const tarProcess = spawn('tar', ['-xzvf', tmpPath, '-C', fullExtractPath]);

        let stderrData = '';
        tarProcess.stderr.on('data', data => { stderrData += data.toString(); });
        tarProcess.on('close', code => {
            fs.unlinkSync(tmpPath);
            if (code !== 0) return reject(new Error(`tar exited with code ${code}. Stderr: ${stderrData}`));
            resolve();
        });
        tarProcess.on('error', err => {
            if (fs.existsSync(tmpPath)) fs.unlinkSync(tmpPath);
            reject(new Error(`tar process error: ${err.message}`));
        });
    });

    await waitForFileSystem(extractPath);
    await new Promise(resolve => setTimeout(resolve, 1000)); // стабилизация
    return extractPath; // путь к распакованной сессии
}

module.exports = {importSession};
