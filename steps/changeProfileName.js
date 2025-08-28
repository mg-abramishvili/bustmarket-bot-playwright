const goToProfilePage = require("./goToProfilePage");

async function changeProfileName(page, person) {
    // Пауза
    await new Promise(r => setTimeout(r, 2000));

    try {
        // Переход в профиль
        const isProfilePageOpened = await goToProfilePage(page);
        if (!isProfilePageOpened) return false;

        await new Promise(r => setTimeout(r, 2000));

        // Нажатие на имя профиля
        const setNameButton = page.locator('[data-autotest-button="displayName"]');
        await setNameButton.waitFor({state: 'visible'});
        await setNameButton.click();

        await new Promise(r => setTimeout(r, 2000));

        // Указание имени профиля
        const nameInput = page.locator('form input[name=firstName]');
        await nameInput.waitFor({state: 'visible'});

        await new Promise(r => setTimeout(r, 2000));

        // Очистка и ввод имени
        await nameInput.fill('');
        await nameInput.focus();
        await page.type('form input[name=firstName]', person.name, {delay: 500});

        await new Promise(r => setTimeout(r, 2000));

        // Указание пола
        const genderMap = {male: "Male", female: "Female"};
        const genderInput = page.locator(`form input[name="gender"][value="${genderMap[person.gender]}"]`);
        await genderInput.waitFor({state: 'visible'});
        await genderInput.check();

        await new Promise(r => setTimeout(r, 2000));

        // Подтверждение имени и пола
        const submitButton = page.locator('form button[type="submit"]');
        await submitButton.waitFor({state: 'visible'});
        await submitButton.click();

        return true;
    } catch {
        return false;
    }
}

module.exports = changeProfileName;