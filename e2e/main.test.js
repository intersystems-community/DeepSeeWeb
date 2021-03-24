const fs = require('fs');
const pkg = require('./../package.json');
const xml2js = require('xml2js');
const puppeteer = require('puppeteer');

let browser = null;
let page = null;
const URL = 'http://127.0.0.1:52773/dsw/index.html#/';
const DEF_NS = 'IRISAPP';
const DEF_LOGIN = '_SYSTEM';
const DEF_PASS = 'SYS';

const SCR_WIDTH = 1600;
const SCR_HEIGHT = 1200;

// const URL = 'http://samples-bi.demo.community.intersystems.com/dsw/index.html#/';
// const DEF_NS = 'USER';

let consoleOut = '';

describe("Version", () => {
    test("Check module.xml version", async () => {
        const parser = new xml2js.Parser();
        const xmlFile = fs.readFileSync('./module.xml', 'utf8');
        parser.parseString(xmlFile, function (err, result) {
            expect(result.Export.Document[0].Module[0].Version[0]).toBe(pkg.version);
        });
    });

    /*test("Check changelog.md last version", async () => {
        const file = fs.readFileSync('./src/changelog.md', 'utf8');
        const idx = file.indexOf("\n");
        const ver = file.substr(0, idx).replace('####', '').trim();
        expect(ver).toBe(pkg.version);
    });*/
});

describe("Site loading", () => {
    test('Login page display', async () => {
        browser = await puppeteer.launch();
        page = await browser.newPage();

        // Catch all failed requests like 4xx..5xx status codes
        page.on('requestfailed', request => {
            consoleOut +=`url: ${request.url()}, errText: ${request.failure().errorText}, method: ${request.method()}\n`
        });
        // Catch console log errors
        page.on("pageerror", err => {
            consoleOut += `Page error: ${err.toString()}\n`;
        });
        // Catch all console messages
        page.on('console', msg => {
            consoleOut += msg.text() + '\n';
            consoleOut += '    ' + msg.location().url + '\n';
        });


        await page.setDefaultTimeout(5000);
        await page.setViewport({
            width: SCR_WIDTH,
            height: SCR_HEIGHT,
            deviceScaleFactor: 1,
        });

        await page.goto(URL + 'login', {
            waitUntil: 'networkidle0'
        });
        await page.waitForSelector('.login-form')
    });

    test('Version on login page', async () => {
        await page.waitForSelector('.ver')
        let element = await page.$('.ver');
        let value = await page.evaluate(el => el.textContent, element)
        expect(value).toBe(pkg.version);
    });
});

describe("Authorization", () => {
    test('Login', async () => {
        let input = await page.waitForSelector('#dswLogin');
        await input.type(DEF_LOGIN);
        input = await page.waitForSelector('#dswPasword');
        await input.type(DEF_PASS);
        input = await page.waitForSelector('#ns');
        await input.type(DEF_NS);
        await page.click('#login');

        await page.waitForSelector('dsw-header');
    });
});

describe("Dashboards", () => {
    test('Listing', async () => {
        await page.waitForSelector('gridster-item');
    });
});

afterEach(async () => {
    await page?.screenshot({path: './e2e/screenshots/' + expect.getState().currentTestName + '.png'});
});

afterAll(async () => {
    fs.writeFileSync('./e2e/screenshots/console.log', consoleOut);
    await browser.close();
});

