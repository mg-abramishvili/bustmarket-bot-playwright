const fs = require('fs').promises;

async function cleanupSession(sessionId, context, sessions, sessionDir) {
    if (!context) return;

    try {
        await context.close();
    } catch (err) {
        console.error(`Ошибка при закрытии контекста сессии ${sessionId}:`, err);
    }

    // удаляем сессию из объекта sessions
    delete sessions[sessionId];

    // Пауза 5 секунд перед удалением папки
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Удаляем папку сессии
    try {
        await fs.rm(sessionDir, { recursive: true, force: true });
        console.log(`Папка сессии ${sessionDir} удалена`);
    } catch (err) {
        console.error(`Ошибка при удалении папки сессии ${sessionDir}:`, err);
    }
}

module.exports = cleanupSession;
