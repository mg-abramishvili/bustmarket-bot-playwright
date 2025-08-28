const apiKey = '737f145278df4e0db184acc20fa449fb';

async function getPhoneNumber() {
    const getNumUrl = `https://moresms.net/api/getNumber/?apiKey=${apiKey}&service=wb&country=ru`;

    try {
        const response = await fetch(getNumUrl);
        const data = await response.json();

        if (data.tel) {
            return {
                idNum: data.idNum,
                tel: String(data.tel).replace('+', ''),
            };
        }

        return null;
    } catch (e) {
        return null;
    }
}

async function waitForSms(idNum, timeout = 60000) {
    const start = Date.now();
    const url = `https://moresms.net/api/getSmsCode/?apiKey=${apiKey}&idNum=${idNum}`;

    while (Date.now() - start < timeout) {
        try {
            const response = await fetch(url);
            const data = await response.json();

            if (data.smsCode && data.smsCode !== "null") {
                return data.smsCode;
            }

            await new Promise(r => setTimeout(r, 5000));
        } catch (e) {
            await new Promise(r => setTimeout(r, 5000));
        }
    }

    return null;
}

async function cancelPhoneNumber(idNum) {
    const url = `https://moresms.net/api/setStatus/?apiKey=${apiKey}&idNum=${idNum}&status=end`;
    try {
        const response = await fetch(url);
        return await response.json();
    } catch (e) {
        return null;
    }
}

module.exports = {getPhoneNumber, waitForSms, cancelPhoneNumber};