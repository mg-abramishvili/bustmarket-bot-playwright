async function deletePaymentMethod(page, cardId) {
    return await page.evaluate(async (cardId) => {
        const tokenData = JSON.parse(localStorage.getItem("wbx__tokenData") || "{}");
        const bearerToken = tokenData.token || "";
        if (!bearerToken) throw new Error("Bearer токен не найден");

        const url = "https://www.wildberries.ru/__internal/ru-basket-api/webapi/lk/account/spa/deletecard";
        const res = await fetch(url, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${bearerToken}`,
                "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
            },
            body: `cardId=${cardId}&currency=RUB&locale=ru&currentLocale=ru&paymentCode=crd`
        });

        if (!res.ok) throw new Error(`Ошибка запроса: ${res.status}`);

        const data = await res.json();
        console.log("Ответ:", data);
        return data.value ?? null;
    }, cardId);
}

module.exports = deletePaymentMethod;
