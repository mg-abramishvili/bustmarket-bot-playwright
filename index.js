const {chromium} = require('playwright');
const createOrder = require('./scenarios/createOrder.js');

(async () => {
    // Сессии
    const sessions = ['./sessions'];

    const tasks = sessions.map(async (path) => {
        const context = await chromium.launchPersistentContext(path, {
            headless: false,
            devtools: false,
            viewport: {width: 1600, height: 900},
        });

        // Дефолтный таймаут ожидания элементов
        context.setDefaultTimeout(30000);

        // Переход на страницу
        const page = await context.newPage();
        await page.goto('https://www.wildberries.ru', {waitUntil: 'domcontentloaded'});

        // Дополнительная пауза на всякий случай
        await page.waitForTimeout(5000);

        // Выкуп
        await createOrder(
            page,
            1,
            1,
            13458176,
            null,
            356,
            4,
            5182,
            "г. Долгопрудный, Советская улица 9"
        );

        // Закрытие окна
        await context.close();
    });

    await Promise.all(tasks);
})();
