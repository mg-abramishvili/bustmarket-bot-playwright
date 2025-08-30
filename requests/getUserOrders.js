async function getUserOrders(page) {
    return await page.evaluate(async () => {
        const tokenData = JSON.parse(localStorage.getItem("wbx__tokenData") || "{}");
        const bearerToken = tokenData.token || "";
        if (!bearerToken) throw new Error("Bearer токен не найден");

        const url = "https://wbxoofex.wildberries.ru/api/v2/orders";
        const res = await fetch(url, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${bearerToken}`,
                "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
            },
        });

        if (!res.ok) throw new Error(`Ошибка запроса: ${res.status}`);

        const data = await res.json();

        console.log("Ответ:", data);

        let result = [];

        if (Array.isArray(data.data)) {
            data.data.forEach(order => {
                if (Array.isArray(order.rids)) {
                    order.rids.forEach(item => {
                        result.push({
                            nm_id: item?.nm_id ?? null,
                            uid: item?.uid ?? null
                        });
                    });
                }
            });
        }

        return result.length > 0 ? result : null;
    });
}

module.exports = getUserOrders;