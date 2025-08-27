const {createLogger} = require("../utils/log");
const {sendOrderDataToServer} = require("../utils/sendToServer");
const checkForAuth = require("../steps/checkForAuth");
const deletePaymentMethods = require("../steps/deletePaymentMethods");
const choosePvz = require("../steps/choosePvz");
const addSbp = require("../steps/addSbp");
const findProduct = require("../steps/findProduct");
const checkCart = require("../steps/checkCart");
const makePayment = require("../steps/makePayment");
const confirmOrder = require("../steps/confirmOrder");
const goToCart = require("../steps/goToCart");
const getPaymentMethods = require("../requests/getPaymentMethods");

async function createOrder(page, sessionId, orderId, artnumber, keyword, price, quantity, pvzId, pvzAddress) {
    const log = createLogger(orderId);

    const cancelOrder = async () => {
        await log("Заказ отменён");
        await sendOrderDataToServer(orderId, 'is_cancelled', true);
    };

    const finish = async () => {
        await log("Заказ успешно создан");
        await sendOrderDataToServer(orderId, 'is_created', true);
    };

    await log('Заказ - Проверка на авторизацию');
    const isLoggedIn = await checkForAuth(page);
    if (!isLoggedIn) return await cancelOrder();

    await log('Заказ - Удаление старых способов оплаты из профиля');
    const isOldPaymentMethodsDeleted = await deletePaymentMethods(page);
    if(!isOldPaymentMethodsDeleted) return await cancelOrder();

    await log('Заказ - Добавление СБП');
    const isSbpAdded = await addSbp(page, orderId);
    if (!isSbpAdded) return await cancelOrder();

    await log("Отправка запроса на получение способов оплаты");
    // const paymentMethods = await getPaymentMethods(page);
    // if (!paymentMethods) return await cancelOrder();
    // console.log(paymentMethods);

    let paymentMethods;
    for (let i = 1; i <= 3; i++) {
        paymentMethods = await getPaymentMethods(page);
        if (paymentMethods?.length) break;

        if (i < 3) await page.waitForTimeout(3000 * i);
    }

    if (!paymentMethods?.length) {
        await log("Не удалось получить способы оплаты после 3 попыток");
        await cancelOrder();
    }

    await log("Получение названия способа оплаты");
    const paymentMethodName = paymentMethods[0]?.name;
    if(!paymentMethodName) return false;

    await sendOrderDataToServer(orderId, 'is_paid', true);

    // Большая пауза
    await page.waitForTimeout(45000);

    await log('Заказ - Выбор ПВЗ')
    const isPvzSelected = await choosePvz(page, orderId, pvzId, pvzAddress);
    if (!isPvzSelected) return await cancelOrder();

    await log('Заказ - Поиск товара');
    const isProductFoundAndInCart = await findProduct(page, orderId, artnumber, keyword);
    if (!isProductFoundAndInCart) return await cancelOrder();

    await log('Переход в корзину');
    const isGoToCartClicked = await goToCart(page);
    if (!isGoToCartClicked) return false;

    await log('Заказ - Проверка корзины');
    const isCartChecked = await checkCart(page, orderId, artnumber, quantity);
    if (!isCartChecked) return await cancelOrder();

    await log('Заказ - Оплата');
    const isPaymentCompleted = await makePayment(page, orderId, paymentMethodName);
    if (!isPaymentCompleted) return await cancelOrder();

    await log('Заказ - Подтверждение заказа');
    const isOrderConfirmed = await confirmOrder(page, orderId);
    if (!isOrderConfirmed) return await cancelOrder();

    // Большая пауза
    await page.waitForTimeout(20000);

    await finish();

    // Отвяжем способ оплаты
    await deletePaymentMethods(page);

    await page.waitForTimeout(1000);
}

module.exports = createOrder;