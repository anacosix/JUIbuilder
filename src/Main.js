const JUIBuilder = require('./JUIBuilder.js');
const fs = require('fs');

// TESTCASES
const jsonSchemaOne = require('../assets/testcases/jsonSchema1.json');
const elementConfigMapOne = require('../assets/testcases/elementConfigMap1.json');
const elementConfigMapTwo = require('../assets/testcases/elementConfigMap2.json');
const jsonDataTestCase1 = require('../assets/testcases/jsonDataTestCase1.json');
const jsonDataTestCase2 = require('../assets/testcases/jsonDataTestCase2.json');
const jsonDataTestCase3 = require('../assets/testcases/jsonDataTestCase3.json');
const jsonDataTestCase4 = require('../assets/testcases/jsonDataTestCase4.json');
const jsonDataTestCase5 = require('../assets/testcases/jsonDataTestCase5.json');
const jsonDataTestCase6 = require('../assets/testcases/jsonDataTestCase6.json');

const converter = new JUIBuilder();

let htmlMarkup = converter.processEventData(jsonDataTestCase6);

// For presentation purposes
try {
    fs.writeFileSync("index.html", htmlMarkup);
    console.log('File written successfully.');
} catch (error) {
    console.error('Error writing file:', error);
}