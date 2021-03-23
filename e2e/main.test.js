const fs = require('fs');
const pkg = require('./../package.json');
const xml2js = require('xml2js');
const puppeteer = require('puppeteer');

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
    test('Login page', async () => {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.goto('http://127.0.0.1:51773/dsw.index');
        await page.screenshot({ path: './e2e/screenshots/login-page.png' });
    });
});
