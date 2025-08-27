const getPaymentMethodsRequest = require("../requests/getPaymentMethodsRequest");

async function getCurrentPaymentMethod(page) {
    let paymentMethods;
    for (let i = 1; i <= 5; i++) {
        paymentMethods = await getPaymentMethodsRequest(page);
        if (paymentMethods?.length) break;

        if (i < 3) await page.waitForTimeout(10000 * i);
    }

    if (!paymentMethods?.length) return null;

    const paymentMethodName = paymentMethods[0]?.name;
    if(!paymentMethodName) return null;

    return paymentMethodName;
}

module.exports = getCurrentPaymentMethod;