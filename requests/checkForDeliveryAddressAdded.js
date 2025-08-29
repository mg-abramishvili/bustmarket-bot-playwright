async function checkForDeliveryAddressAdded(page, address) {
    return await page.evaluate(async (address) => {
        const tokenData = JSON.parse(localStorage.getItem("wbx__tokenData") || "{}");
        const bearerToken = tokenData.token || "";
        if (!bearerToken) throw new Error("Bearer токен не найден");

        let coordinates = address.coordinates.split(",");

        let lat = coordinates[0];
        let lon = coordinates[1];

        const url = "https://www.wildberries.ru/__internal/ru-basket-api/spa/yandexaddress/editajax?version=2";
        const res = await fetch(url, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${bearerToken}`,
                "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
            },
            body: `country=Россия&city=${address.city}&street=${address.street}&home=${address.home}&lat=${lat}&lon=${lon}`,
        });

        if (!res.ok) throw new Error(`Ошибка запроса: ${res.status}`);

        const data = await res.json().catch(() => res.text());
        console.log("Ответ:", data);
        return res.status === 200;
    }, address);
}

module.exports = checkForDeliveryAddressAdded;