async function changeProfileGenderRequest(page, gender) {
    return await page.evaluate(async (gender) => {
        const tokenData = JSON.parse(localStorage.getItem("wbx__tokenData") || "{}");
        const bearerToken = tokenData.token || "";
        if (!bearerToken) throw new Error("Bearer токен не найден");

        const url = "https://www.wildberries.ru/webapi/personalinfo/sex";
        const res = await fetch(url, {
            method: "PATCH",
            headers: {
                "Authorization": `Bearer ${bearerToken}`,
                "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
            },
            body: `sex=${gender}`
        });

        if (!res.ok) throw new Error(`Ошибка запроса: ${res.status}`);

        const data = await res.json();
        console.log("Ответ внутри evaluate:", data);
        return res.status === 200;
    }, gender);
}

module.exports = changeProfileGenderRequest;
