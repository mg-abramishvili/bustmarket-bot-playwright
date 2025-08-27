const getPaymentMethodsRequest = require('../requests/getPaymentMethodsRequest');
const deletePaymentMethod = require('../requests/deletePaymentMethod');

async function deletePaymentMethods(page)  {
    // Открытие окна способов оплаты
    const paymentMethods = await getPaymentMethodsRequest(page);

    if(paymentMethods && paymentMethods.length) {
        for (const paymentMethod of paymentMethods) {
            await deletePaymentMethod(page, paymentMethod.id);
        }
    }

    // Проверка, что список очистился
    let attempts = 3;
    while (attempts > 0) {
        const remaining = await getPaymentMethodsRequest(page);

        if (!remaining || remaining.length === 0) {
            return true; // Всё удалено
        }

        attempts--;
        if (attempts > 0) {
            // Подождать 5 секунд перед новой проверкой
            await new Promise((resolve) => setTimeout(resolve, 5000));
        }
    }

    // Если после 3 попыток список всё ещё не пустой
    return false;
}

module.exports = deletePaymentMethods;