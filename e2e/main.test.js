const fs = require('fs');
const pkg = require('./../package.json');
const xml2js = require('xml2js');
const puppeteer = require('puppeteer');

let browser = null;
let page = null;
const URL = 'http://127.0.0.1:52773/dsw/index.html#/';
// const URL = 'http://samples-bi.demo.community.intersystems.com/dsw/index.html#/';
const DEF_LOGIN = '_SYSTEM';
const DEF_PASS = 'SYS';
const DEF_NS = 'USER';

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

function delay(time) {
    return new Promise(function(resolve) {
        setTimeout(resolve, time)
    });
}

describe("Site loading", () => {
    test('Login page display', async () => {
        browser = await puppeteer.launch();
        page = await browser.newPage();
        await page.setDefaultTimeout(5000);
        await page.setViewport({
            width: 1600,
            height: 720,
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
    await browser.close();
});

