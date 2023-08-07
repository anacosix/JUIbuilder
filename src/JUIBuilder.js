const elementConfigMapDefault = require('../assets/data/elementConfigMap.json');

const DataProcessor = require('./DataProcessor');
const HtmlUtils = require('./HtmlUtils');
const SchemaUtils = require('./SchemaUtils');

class JUIBuilder {
    // Constructor for JUIBuilder class
    constructor(elementConfigMap = null) {
        this.jsonSchema = '';

        // Set default element config or from the input
        this.elementConfigMap = (elementConfigMap === null) ? elementConfigMapDefault : this.validateHtml(elementConfigMap) ? elementConfigMap : null;
    }

    // Check validity of html in elementConfigMap
    validateHtml(configMap) {
        return HtmlUtils.validateHtml(configMap);
    }


    // Check validity of provided JSON data based on JSON schema and syntax
    validateSchema(data, schema = null) {
        return SchemaUtils.validateSchema(data, schema, this.jsonSchema, this.elementConfigMap);
    }

    // Return html generated from provided JSON data
    processEventData(jsonData, jsonSchema = null) {
        if (!this.validateSchema(jsonData, jsonSchema)) {
            return '';
        }

        const processedHtml = `<!DOCTYPE html>
                                <html lang="de">
                                  <body>
                                    <form id="htmlForm">
                                        ${this.processObject(jsonData, this.elementConfigMap)}
                                        ${DataProcessor.listCount !== 0 ? this.addButtonEventListener() : ''}
                                      <hr>
                                      <input id="submitFormInput" type="submit" value="Speichern">
                                    </form>
                                  </body>
                                </html>`;

        return HtmlUtils.processHtmlMarkup(processedHtml);
    }

    // Process JSON object and generate HTML elements
    processObject(objectData, elementConfigMap) {
        return DataProcessor.processObject(objectData, elementConfigMap);
    }


    // Add event listeners to the list buttons
    addButtonEventListener(listCount) {
        return DataProcessor.addButtonEventListener(listCount);
    }
}

module.exports = JUIBuilder;