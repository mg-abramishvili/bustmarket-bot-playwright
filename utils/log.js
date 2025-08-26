const {sendOrderWorkerLogToServer} = require('./sendToServer');

let currentOrderId = null;

function setOrderId(orderId) {
    currentOrderId = orderId;
}

async function log(message) {
    console.log(message);

    if(currentOrderId) {
        try {
            await sendOrderWorkerLogToServer(currentOrderId, message);
        } catch (error) {
            console.error(`Не удалось отправить лог на сервер: ${error.message}`);
        }
    }

    return new Promise(resolve => {
        resolve();
    });
}

module.exports = {log, setOrderId};