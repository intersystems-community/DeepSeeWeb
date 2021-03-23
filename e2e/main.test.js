const fs = require('fs');
const pkg = require('./../package.json');
const xml2js = require('xml2js');
const puppeteer = require('puppeteer');

let browser = null;

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
    test('Login page', async () => {
            browser = await puppeteer.launch();
            const page = await browser.newPage();
            await page.setViewport({
                width: 1600,
                height: 720,
                deviceScaleFactor: 1,
            });
            await page.goto('http://127.0.0.1:52773/dsw/index.html#/login');
            await delay(1000);
            await page.screenshot({path: './e2e/screenshots/login-page.png'});
    });
});

afterAll(async () => {
    await browser.close();
});

