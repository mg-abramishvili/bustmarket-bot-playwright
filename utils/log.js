const {sendOrderWorkerLogToServer} = require('./sendToServer');

function createLogger(orderId = null) {
    return async function log(message) {
        if (orderId) {
            console.log(`[${orderId}] ${message}`);
            try {
                await sendOrderWorkerLogToServer(orderId, message);
            } catch (error) {
                console.error(`Не удалось отправить лог на сервер: ${error.message}`);
            }
        } else {
            console.log(message); // просто консольный вывод без отправки на сервер
        }
    };
}

module.exports = { createLogger };