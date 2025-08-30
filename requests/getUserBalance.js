async function getUserBalance(page,) {
    return await page.evaluate(async () => {
        const tokenData = JSON.parse(localStorage.getItem("wbx__tokenData") || "{}");
        const bearerToken = tokenData.token || "";
        if (!bearerToken) throw new Error("Bearer токен не найден");

        const url = "https://www.wildberries.ru/webapi/account/getsignedbalance";
        const res = await fetch(url, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${bearerToken}`,
                "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
            },
            body: ``
        });

        if (!res.ok) throw new Error(`Ошибка запроса: ${res.status}`);

        const data = await res.json();

        console.log("Ответ:", data);

        let balance = -1;

        if (data.value?.moneyBalanceRUB) {
            console.log(data.value.moneyBalanceRUB)
            balance = data.value.moneyBalanceRUB;
        }

        return balance >= 0;
    });
}

module.exports = getUserBalance;