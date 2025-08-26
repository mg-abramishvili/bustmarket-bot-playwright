const {log} = require('../utils/log');
const axios = require('axios');

async function sendOrderDataToServer(order_id, field, value) {
    const url = `${process.env.API_SERVER}/api/orders/${order_id}/worker-update`;

    try {
        await log('Начинаем HTTP запрос через axios...');

        const response = await axios({
            method: 'PUT',
            url: url,
            headers: {
                'Content-Type': 'application/json',
            },
            data: {[field]: value},
            timeout: 30000 // 30 секунд таймаут
        });

        await log(`Ответ получен: ${response.status}`);
        return response.status >= 200 && response.status < 300;

    } catch (error) {
        await log(`Ошибка axios: ${error.message}`);
        if (error.response) {
            await log(`Статус ошибки: ${error.response.status}`);
            await log(`Данные ошибки: ${JSON.stringify(error.response.data)}`);
        }
        return false;
    }
}

async function sendOrderWorkerLogToServer(order_id, name, description = null) {
    const url = `${process.env.API_SERVER}/api/order-worker-logs`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                order_id: order_id,
                name: name,
                description: description,
            })
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        throw error;
    }
}

async function sendSessionDataToServer(session_id, field, value) {
    const url = `${process.env.API_SERVER}/api/worker-sessions/${session_id}`;

    try {
        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({[field]: value})
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        throw error;
    }
}

module.exports = {
    sendOrderDataToServer,
    sendOrderWorkerLogToServer,
    sendSessionDataToServer,
};