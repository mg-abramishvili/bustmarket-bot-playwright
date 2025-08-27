async function cartSaveRequest(page, pvzId) {
    return await page.evaluate(async (pvzId) => {
        const tokenData = JSON.parse(localStorage.getItem("wbx__tokenData") || "{}");
        const bearerToken = tokenData.token || "";
        if (!bearerToken) throw new Error("Bearer токен не найден");

        const url = "https://www.wildberries.ru/__internal/ru-basket-api/spa/params/save";
        const res = await fetch(url, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${bearerToken}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({paymentTypeId: "63", deliveryWay: "self", addressId: pvzId})
        });

        if (!res.ok) throw new Error(`Ошибка запроса: ${res.status}`);

        const data = await res.json();
        console.log("Ответ внутри evaluate:", data);
        return res.status === 200;
    }, pvzId);
}

module.exports = cartSaveRequest;