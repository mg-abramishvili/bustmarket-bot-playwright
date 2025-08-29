const {createLogger} = require('../utils/log');
const choosePvzRequest = require('../requests/choosePvzRequest');
const addDeliveryAddressRequest = require('../requests/addDeliveryAddressRequest');
const chooseAddressButton = require('../steps/chooseAddressButton');
const selectPvzFromList = require('../steps/selectPvzFromList');

async function choosePvzOrAddress(page, orderId, pvzId, pvzAddress, address, mode) {
    const log = createLogger(orderId);

    if (mode === 'pvz') {
        if (!pvzId || !pvzAddress) return false;
        await log('Отправка запроса на добавление ПВЗ в профиль');
        const isPvzAddedToProfile = await choosePvzRequest(page, pvzId);
        if (!isPvzAddedToProfile) return false;
    }

    if (mode === 'dbs') {
        if (!address) return false;

        if(!address.coordinates) return false;
        if(!address.city) return false;
        if(!address.street) return false;
        if(!address.home) return false;

        await log('Отправка запроса на добавление адреса в профиль');
        const isPvzAddedToProfile = await addDeliveryAddressRequest(page, address);
        if (!isPvzAddedToProfile) return false;
    }

    await log('Открытие окна с выбором адреса');
    const isChooseAddressButtonPressed = await chooseAddressButton(page);
    if (!isChooseAddressButtonPressed) return false;

    await log('Выбор ПВЗ из из списка');
    const isPvzSelected = await selectPvzFromList(page, pvzAddress);
    if (!isPvzSelected) return false;

    return true;
}

module.exports = choosePvzOrAddress;