async function changeProfileNameRequest(page, name) {
    return await page.evaluate(async (name) => {
        const tokenData = JSON.parse(localStorage.getItem("wbx__tokenData") || "{}");
        const bearerToken = tokenData.token || "";
        if (!bearerToken) throw new Error("Bearer токен не найден");

        const url = "https://www.wildberries.ru/webapi/personalinfo/fio";
        const res = await fetch(url, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${bearerToken}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "firstName": name,
                "lastName": "",
                "middleName": "",
                "email": ""
            })
        });

        if (!res.ok) throw new Error(`Ошибка запроса: ${res.status}`);

        const data = await res.json();
        console.log("Ответ внутри evaluate:", data);
        return res.status === 200;
    }, name);
}

module.exports = changeProfileNameRequest;
