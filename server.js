import express from "express";
import { Server } from "socket.io";
import ViteExpress from "vite-express";
import multer from "multer";
import csv from "fast-csv";
import fs from 'fs';
import { URL } from 'node:url';
import {
    getDatabase,
    addUrlToDb,
    getDataToWorkOn,
    getStatusCount,
    deleteTable,
    getUrlData,
} from "./server/databaseScript.js";
import { DataExtractorPuppeteer } from "./server/puppetter-scripts/init.js";
import bodyParser from "body-parser";
import 'dotenv/config';
import utils from './server/utils.js';
import puppeteer, { executablePath } from "puppeteer";
import Url from "./server/model.js";

const upload = multer({ dest: 'tmp/csv/' });
const app = express();
const port = process.env.PORT || 3000;
let scriptRunning = false;

const isProtected = process.env.ENV === 'production';

const server = app.use(bodyParser.json()).use(bodyParser.urlencoded({
    extended: true
})).listen(port, "0.0.0.0", () =>
    console.log("Server is listening..."));
const io = new Server(server);

export const database = await getDatabase(new URL('db/database.db', import.meta.url).pathname);
export const databaseTableName = 'domain';

await database.exec(
    `CREATE TABLE IF NOT EXISTS ${databaseTableName} (
    'id' INTEGER PRIMARY KEY,
    'url' VARCHAR(20) NOT NULL UNIQUE,
    'status' TEXT(50) NOT NULL DEFAULT 'not_started',
    'error' VARCHAR(1000))`
);

app.post('/upload', upload.single('file'), function (req, res) {
    const fileRows = [];

    csv.parseFile(req.file.path, {
        headers: true,
    })
    .on("data", function (data) {
        fileRows.push(data);
    })
    .on("end", function () {
        fs.unlinkSync(req.file.path);
        addUrlToDb(database, fileRows).then((r) => {
            return res.status(200).send({
                usrMsg: r,
            });
        })
        .catch((e) => {
            return res.status(500).send({
                usrMsg: `Unable to save domains ${e}`
            });
        })
    });
});

app.get('/domain-count', function (req, res) {
    getStatusCount(database)
    .then((response) => {
        return res.status(200).send({
            status: 'SUCCESS',
            data: response
        })
    })
    .catch((e) => {
        return res.status(500).send({
            status: 'ERROR',
            userMsg: `ERROR ${e}`,
        })
    })
});

app.get('/all-domain', function (req, res) {
    database.all('SELECT * FROM domain')
    .then((data) => {
        return res.status(200).send({
            status: 'SUCCESS',
            data: data
        })
    })
    .catch((e) => {
        return res.status(500).send({
            status: 'ERROR',
            userMsg: `ERROR ${e}`,
        })
    })
});

app.delete('/delete-database', function (req, res) {
    if (isProtected) {
        return res.status(500).send({
            status: 'ERROR',
            userMsg: 'You cant do this.',
        })
    }
    deleteTable(database)
        .then(() => {
            return res.status(200).send({
                status: 'SUCCESS',
            })
        })
        .catch(() => {
            return res.status(500).send({
                status: 'ERROR',
            })
        })
});

app.post('/download-csv', function (req, res) {
    getUrlData(database, req.body.type)
        .then((data) => {
            let csvData = [];
            csvData.push(['id', 'url', 'status', 'error']);
            data.forEach((item) => {
                csvData.push(Object.values(item));
            })
            return res.status(200).attachment('data.csv').send(csvData)
        })
        .catch((e) => {
            return res.status(500).send({
                status: 'ERROR',
                userMsg: JSON.stringify(e),
            })
        })
});

app.get('/status', function (req, res) {
    return res.status(200).send({
        status: 'SUCCESS',
        data: {
            scriptRunning: scriptRunning,
        }
    })
})

io.on('connection', (socket) => {
    socket.on('start_scraping', (data) => {
        if (data.runScript) {
            scriptRunning = true;
            startScraping();
        } else {
            scriptRunning = false;
            getStatusCount(database)
                .then((data) => {
                    io.emit('update_scraping', {
                        newCount: data,
                        backendScriptStatus: scriptRunning,
                    })
                })
        }
    });

    socket.on('disconnect', () => {
        // console.log('Socket.io Dis-Connected.');
    });
})

export const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: '/usr/bin/chromium-browser',
    args: ['--no-sandbox'],
    timeout: 0,
});


async function startScraping() {
    const dataToWorkOn = await getDataToWorkOn(database);

    if (dataToWorkOn === false) {
        console.log('😔 No more data to work on!');
        scriptRunning = false;
        io.emit('update_scraping', {
            newCount: await getStatusCount(database),
            backendScriptStatus: scriptRunning,
        })
        return;
    }

    for (let i = 0; i < dataToWorkOn.length; i++) {
            io.emit('update_scraping', {
                urlProcessed: dataToWorkOn[i],
                newCount: await getStatusCount(database),
                backendScriptStatus: scriptRunning,
            })
            const urlItem = new Url(dataToWorkOn[i]);

            try {
                await urlItem.setStatus('processing');

                utils.info(dataToWorkOn[i].url, '🏁 Started');

                if (!isValidHttpUrl(dataToWorkOn[i].url)) {
                    throw new Error('Invalid URL')
                }
                const page = await browser.newPage();
                const initExtractor = new DataExtractorPuppeteer(page, urlItem);
                await initExtractor.startProcessing();
                utils.info(dataToWorkOn[i].url, '✅ Done');
                console.log('');
            } catch (e) {
                await urlItem.setStatus('error');
                await urlItem.setError(`Error: ${e}`);
                utils.error(dataToWorkOn[i].url, `Error: ${e}`);
                console.log('');
            } finally {
                if (scriptRunning) {
                    startScraping();
                }
            }

            io.emit('update_scraping', {
                urlProcessed: dataToWorkOn[i],
                newCount: await getStatusCount(database),
                backendScriptStatus: scriptRunning,
            })
    }

}

function isValidHttpUrl(string) {
    let url;

    try {
        url = new URL(string);
    } catch (_) {
        return false;
    }

    return url.protocol === "http:" || url.protocol === "https:";
}

ViteExpress.bind(app, server, () => {
    console.log(`Server is listening at port ${port}`)
    console.log('');
    console.log('Attempting to start/resume scraping');
    scriptRunning = true;
    startScraping();
});
