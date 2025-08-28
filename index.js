const fs = require('fs');
const path = require('path');
const express = require('express');
const {chromium} = require('playwright');
require('dotenv').config();

const {importSession} = require('./sessionImport');
const {exportSession} = require('./sessionExport');
const cleanupSession = require('./sessionCleanup');
const {captureAndUpload} = require('./screenshot');

const newSession = require('./scenarios/newSession.js');
const createOrder = require('./scenarios/createOrder.js');
const checkOrderStatus = require('./scenarios/checkOrderStatus.js');
const createReview = require('./scenarios/createReview.js');

function startServer() {
    const app = express();
    const PORT = 3000;

    app.use(express.json());

    // Конфигурация маркетплейсов
    const MP_CONFIG = {
        wb: {url: 'https://www.wildberries.ru'},
    };

    // Сценарии
    const SCENARIO_MAP = {
        '/order': {
            func: createOrder,
            args: ['session_id', 'order_id', 'artnumber', 'keyword', 'price', 'quantity', 'pvz_id', 'pvz_address'],
            requiredArgs: ['session_id', 'order_id', 'artnumber', 'price', 'quantity', 'pvz_id', 'pvz_address'],
            sessionImportRequired: true,
            sessionExportRequired: false,
        },
        '/order-status': {
            func: checkOrderStatus,
            args: ['session_id', 'order_id', 'artnumber'],
            requiredArgs: ['session_id', 'order_id', 'artnumber'],
            sessionImportRequired: true,
            sessionExportRequired: false,
        },
        '/order-review': {
            func: createReview,
            args: ['session_id', 'order_id', 'artnumber', 'review_text'],
            requiredArgs: ['session_id', 'order_id', 'artnumber', 'review_text'],
            sessionImportRequired: true,
            sessionExportRequired: false,
        },
        '/sessions': {
            func: newSession,
            args: ['session_id'],
            requiredArgs: ['session_id'],
            sessionImportRequired: false,
            sessionExportRequired: true,
        }
    };

    // Сессии
    const sessions = {};

    // Функция для запуска Playwright-сессии
    const launchSession = async (sessionId, sessionImportRequired) => {
        const sessionPath = path.join(__dirname, 'sessions', `session_${sessionId}`);

        if (sessionImportRequired) {
            console.log(`Сессия ${sessionId} не найдена, импортируем...`);
            await importSession(sessionId);
            console.log(`Сессия ${sessionId} импортирована`);
        }

        const context = await chromium.launchPersistentContext(sessionPath, {
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
            headless: false,
            devtools: false,
            viewport: {width: 1600, height: 900},
        });
        context.setDefaultTimeout(30000);
        sessions[sessionId].context = context;
        sessions[sessionId].status = 'working';
        return context;
    };

    const handleRequest = (req, res) => {
        const scenario = SCENARIO_MAP[req.path];
        if (!scenario) return res.status(404).json({error: 'Неизвестный путь'});

        if (!req.body.session_id) {
            return res.status(400).json({error: 'Не указан session_id'});
        }

        if (!req.body.mp || !MP_CONFIG[req.body.mp]) {
            return res.status(400).json({error: 'Не указан mp'});
        }

        if(sessions[req.body.session_id]) {
            return res.status(400).json({error: 'Сессия занята'});
        }

        // Валидация только обязательных аргументов
        const missing = scenario.requiredArgs.filter(key => req.body[key] == null);
        if (missing.length) return res.status(400).json({error: `Не указаны обязательные поля: ${missing.join(', ')}`});

        res.json({status: 'OK'}); // сразу ответ

        sessions[req.body.session_id] = {status: 'starting'};

        setImmediate(async () => {
            let context;
            const sessionPath = path.join(__dirname, 'sessions', `session_${req.body.session_id}`);

            try {
                context = await launchSession(req.body.session_id, scenario.sessionImportRequired);
                const page = await context.newPage();
                await page.goto(MP_CONFIG[req.body.mp].url, {waitUntil: 'domcontentloaded'});

                const args = scenario.args.map(k => req.body[k] ?? null);

                try {
                    await scenario.func(page, ...args);
                } catch (err) {
                    console.error(`Ошибка при выполнении сценария ${req.path}:`, err);
                }

                try {
                    await captureAndUpload(page, req.body.session_id);
                } catch (screenshotErr) {
                    console.error('Не удалось сделать скриншот:', screenshotErr);
                }

                await page.close();

                if(scenario.sessionExportRequired) await exportSession(req.body.session_id);
            } catch (err) {
                console.error(`Ошибка при обработке запроса ${req.path}:`, err);
            } finally {
                await cleanupSession(req.body.session_id, context, sessions, sessionPath);
            }
        });
    };

    app.post('/order', handleRequest);
    app.post('/order-status', handleRequest);
    app.post('/order-review', handleRequest);
    app.post('/sessions', handleRequest);

    // Получение количества активных сессий
    app.get('/sessions-count', (req, res) => {
        res.json({activeSessions: Object.keys(sessions).length});
    });

    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}

startServer();
