const {waitForSms} = require("../requests/moreSmsRequest");
const clickOnRequestCodeButton = require("./clickOnRequestCodeButton");

async function checkForSms(page, idNum) {
    const MAX_SMS_ATTEMPTS = 2;
    let smsCode = null;

    for (let attempt = 1; attempt <= MAX_SMS_ATTEMPTS; attempt++) {
        smsCode = await waitForSms(idNum);

        if (smsCode) {
            console.log(`SMS-код получен с попытки ${attempt}`);
            break;
        }

        console.log(`Попытка ${attempt} неудачна. Повторный запрос SMS-кода.`);

        const isAnotherRetryCodeButtonClicked = await clickOnRequestCodeButton(page);
        if (!isAnotherRetryCodeButtonClicked) return null;

        await new Promise(r => setTimeout(r, 3000));
    }

    if (!smsCode) {
        console.log(`SMS-код не получен после ${MAX_SMS_ATTEMPTS} попыток`);
        return null;
    }

    console.log('Получен SMS код: ' + smsCode);

    return smsCode;
}

module.exports = checkForSms;