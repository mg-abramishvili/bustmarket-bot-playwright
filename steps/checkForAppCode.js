async function checkForAppCode(page) {
    const form = page.locator('#spaAuthForm').first();

    try {
        await form.waitFor({state: "visible"});

        const text = await form.innerText();
        return text.includes('приложении');
    } catch {
        return false;
    }
}

module.exports = checkForAppCode;