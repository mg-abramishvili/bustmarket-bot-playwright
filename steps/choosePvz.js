const {createLogger} = require('../utils/log');
const choosePvzRequest = require('../requests/choosePvzRequest');
const chooseAddressButton = require('../steps/chooseAddressButton');
const selectPvzFromList = require('../steps/selectPvzFromList');

async function choosePvz(page, orderId, pvzId, pvzAddress)  {
    const log = createLogger(orderId);

    await log('Отправка запроса на добавление ПВЗ в профиль');
    const isPvzAddedToProfile = await choosePvzRequest(page, pvzId);
    if(!isPvzAddedToProfile) return false;

    await log('Открытие окна с выбором адреса');
    const isChooseAddressButtonPressed = await chooseAddressButton(page);
    if(!isChooseAddressButtonPressed) return false;

    await log('Выбор ПВЗ из из списка');
    const isPvzSelected = await selectPvzFromList(page, pvzAddress);
    if(!isPvzSelected) return false;

    return true;
}

module.exports = choosePvz;