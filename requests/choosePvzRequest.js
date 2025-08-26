async function choosePvzRequest(page, pvzId) {
    return await page.evaluate(async (pvzId) => {
        const tokenData = JSON.parse(localStorage.getItem("wbx__tokenData") || "{}");
        const bearerToken = tokenData.token || "";
        if (!bearerToken) throw new Error("Bearer токен не найден");

        const url = "https://www.wildberries.ru/__internal/ru-basket-api/spa/poos/create?version=1";
        const res = await fetch(url, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${bearerToken}`,
                "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
            },
            body: `Item.AddressId=${pvzId}`
        });

        if (!res.ok) throw new Error(`Ошибка запроса: ${res.status}`);

        const data = await res.json().catch(() => res.text());
        console.log("Ответ:", data);
        return res.status === 200;
    }, pvzId);
}

module.exports = choosePvzRequest;