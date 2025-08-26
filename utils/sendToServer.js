async function sendOrderDataToServer(order_id, field, value) {
    const url = `${process.env.API_SERVER}/api/orders/${order_id}/worker-update`;

    try {
        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({[field]: value})
        });

        if (!response.ok) {
            return false;
        }

        return true;
    } catch (error) {
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