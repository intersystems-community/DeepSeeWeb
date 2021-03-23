const pkg = require('./../package.json');
const fs = require('fs');
const xml2js = require('xml2js');
const util = require('util');

const parser = new xml2js.Parser();
const xmlBuilder = new xml2js.Builder();

const data = fs.readFileSync('./Module.xml');


parser.parseString(data, function (err, result) {
    const ver = result.Export.Document[0].Module[0].Version[0];
    if (ver === pkg.version) {
        console.log('Versiona are equal: ' + pkg.version);
        return;
    }
    result.Export.Document[0].Module[0].Version[0] = pkg.version;

    const xml = xmlBuilder.buildObject(result, {xmldec: { 'version': '1.0', 'encoding': 'UTF-8' }});

    console.log('Changing version of Module.xml to: ' + pkg.version);
    fs.writeFileSync('module.xml', xml);
});

