const {createLogger} = require("../utils/log");
const {sendSessionDataToServer} = require('../utils/sendToServer');
const {getPhoneNumber} = require('../requests/moreSmsRequest');
const openLoginForm = require('../steps/openLoginForm');
const enterPhoneNumber = require('../steps/enterPhoneNumber');
const clickOnRequestCodeButton = require('../steps/clickOnRequestCodeButton');
const checkForAppCode = require("../steps/checkForAppCode");
const checkForSms = require("../steps/checkForSms");
const enterSms = require("../steps/enterSms");
const getRandomName = require('../utils/names');
const changeProfileNameRequest = require('../requests/changeProfileNameRequest');
const changeProfileGenderRequest = require('../requests/changeProfileGenderRequest');

async function newSession(page, sessionId) {
    const log = createLogger(null);

    let account = {phone: null, name: null, gender: null}

    const cancel = async () => {
        await log("Не удалось создать аккаунт");
        return false;
    };

    const finish = async () => {
        await log("Аккаунт успешно создан");
        await sendSessionDataToServer(sessionId, 'account', account);
        return true;
    };

    await log('Открытие формы входа');
    const isLoginFormOpened = await openLoginForm(page);
    if (!isLoginFormOpened) return await cancel();

    await log('Запрос номера у SIM-сервиса')
    const phoneNumberResponse = await getPhoneNumber();
    if (!phoneNumberResponse) {
        await log('Не получен номер от SIM-сервиса');
        return await cancel();
    }

    // Запишем данные - номер телефона и айдишник услуги
    const phoneNumber = phoneNumberResponse.tel;
    const idNum = phoneNumberResponse.idNum;

    if (!phoneNumber || !idNum) {
        await log('Ошибка получения номера от SIM-сервиса');
        return await cancel();
    }

    await log(`Получен номер: ${phoneNumber} (idNum ${idNum})`);

    await log('Ввод номера телефона')
    const isPhoneNumberEntered = await enterPhoneNumber(page, phoneNumber);
    if (!isPhoneNumberEntered) return await cancel();

    await log('Нажатие кнопки Запросить код')
    const isRequestCodeButtonClicked = await clickOnRequestCodeButton(page);
    if (!isRequestCodeButtonClicked) return await cancel();

    // Пауза
    await page.waitForTimeout(5000);

    await log('Проверка упоминания приложения')
    const isCodeSentToApp = await checkForAppCode(page);

    // Если получаем сообщение, что код отправлен в приложение вместо SMS, то ждем
    // И делаем повторную попытку запроса кода по SMS
    if (isCodeSentToApp) {
        await log('Код отправлен в приложение - запрос кода по SMS через 60 сек')
        await page.waitForTimeout(65000);

        await log('Запрос SMS-кода');
        const isRetryCodeButtonClicked = await clickOnRequestCodeButton(page);
        if (!isRetryCodeButtonClicked) return await cancel();
    }

    await log('Ожидание SMS кода');
    const receivedSms = await checkForSms(page, idNum);
    if (!receivedSms) return await cancel();

    await log('Ввод SMS-кода')
    const isSmsEntered = await enterSms(page, receivedSms);
    if (!isSmsEntered) return await cancel();

    // Пауза
    await page.waitForTimeout(10000);

    await log('Изменение имени аккаунта')
    const person = await getRandomName();
    if (!person) return await cancel();

    const isProfileNameChanged = await changeProfileNameRequest(page, person.name);
    if (!isProfileNameChanged) return await cancel();

    const isProfileGenderChanged = await changeProfileGenderRequest(page, person.gender);
    if (!isProfileGenderChanged) return await cancel();

    // Пауза
    await page.waitForTimeout(2000);

    account.phone = phoneNumber;
    account.name = person.name;
    account.gender = person.gender;

    // Завершим работу
    return await finish(true);
}

module.exports = newSession;