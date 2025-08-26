async function openPaymentModal(page) {
    const selector = '.j-b-basket-payment button';
    const button = page.locator(selector).first();

    try {
        await button.waitFor({state: "visible"});
        await button.click();

        return true;
    } catch (err) {
        return false;
    }
}

module.exports = openPaymentModal;