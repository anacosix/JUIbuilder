const schemaJson = require('../assets/data/schema.json');
const Ajv = require('ajv/dist/2020');
const addFormats = require("ajv-formats");
const prettier = require('prettier');
class JUIBuilder {
    constructor(elementConfigMap = null) {
        this.jsonSchema = '';
        // Set elementConfigMap to provided or to default value
        this.elementConfigMap = (elementConfigMap === null) ? {
            identity: {
                tag: 'div',
                style: 'padding: 10px; padding-bottom: 0px;',
                subLevel: {
                    designation: {
                        tag: 'h2'
                    },
                    description: {
                        tag: 'p',
                        style: 'font-size: 14px;'
                    }
                }
            },
            output: {
                tag: 'div',
                style: 'font-weight: bold; padding: 10px;'
            },
            class: {
                subLevel: {
                    designation: {
                        tag: 'h3'
                    }
                }
            },
            list: {
                tag: 'div',
                style: 'margin-bottom: 20px;',
                subLevel: {
                    item: {
                        tag: 'h4'
                    }
                }
            },
            item: {
                tag: 'div',
                style: 'border: 1px solid #ccc; padding: 5px;'
            },
            designation: {
                tag: 'label',
                style: 'font-weight: bold; width: 50vw;'
            }
        } : this.validateHtml(elementConfigMap) ? elementConfigMap : null;
    }

    updateSchemaDisallowAdditionalProperties(schema) {
        if (schema.type === "object" || typeof schema === 'object') {
            schema.additionalProperties = false;
        }

        for (let key in schema) {
            if (typeof schema[key] === "object") {
                this.updateSchemaDisallowAdditionalProperties(schema[key]);
            }
        }
    }

    // Check validity of html in elementConfigMap
    validateHtml(configMap) {
        for (const key in configMap) {
            if (!configMap.hasOwnProperty(key)) {
                continue;
            }

            const value = configMap[key];

            if (typeof value !== 'object' && !value.hasOwnProperty('tag')) {
                continue;
            }

            try {
                const testElement = document.createElement(configMap);

                if (value.hasOwnProperty('style')) {
                    testElement.style.cssText = value.style;
                    if (testElement.style.cssText !== value.style) {
                        console.error(value.style + ' is not valid CSS.');
                        return false;
                    }
                }
            } catch (error) {
                console.error('Error occurred while creating HTML element with the tag ' + value.tag + ': ' + error.message);
                return false;
            }
        }
        return true;
    }

    // Check validity of provided JSON data based on JSON schema and based on syntax
    validateSchema(data, schema = null) {
        if(this.elementConfigMap === null) {
            console.error('The elementConfigMap must contain valid HTML tags and styles.');
        }
        if(schema !== null) {
            this.jsonSchema = schema;
            this.updateSchemaDisallowAdditionalProperties(this.jsonSchema);
        }
        if(this.jsonSchema === null || this.jsonSchema === "") {
            this.jsonSchema = schemaJson;
        }

        const ajv = new Ajv({strict: false});
        addFormats(ajv);
        const validate = ajv.compile(this.jsonSchema);
        const valid = validate(data);

        if(!valid) {
            console.error('The JSON object is not valid against the defined event JSON schema.');
            console.log(validate.errors)
            return false;
        }

        if (typeof data !== 'object' && Array.isArray(data) && data === null) {
            console.error('The input must be a valid JSON object.');
            return false;
        }

        return true;
    }

    // Return html generated from provided JSON data
    processEventData(inputJsonData = null, jsonData, jsonSchema = null) {
        if (!this.validateSchema(jsonData, jsonSchema) || !this.validateSchema(inputJsonData, jsonSchema)) {
            return '';
        }

        const processedHtml =  `<!DOCTYPE html>
                                <html>
                                  <body>
                                    <form action="/form/submit" method="post">
                                      ${this.processObject(jsonData)}
                                      <hr>
                                      <input type="submit" value="Speichern">
                                    </form>
                                  </body>
                                </html>`;

        return prettier.format(processedHtml, {parser: 'html'});
    }

    // Process JSON object and generate HTML elements based on it
    processObject(objectData) {
        let html = '';
        const keys = Object.keys(objectData);

        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];

            if (objectData.hasOwnProperty(key) && this.elementConfigMap.hasOwnProperty(key)) {
                const value = objectData[key];
                const elementConfig = this.elementConfigMap[key];
                let tag = elementConfig.tag ?? 'div';
                let checkedTag = (tag === 'label' && (keys[i + 1] === 'display' || keys[i + 2] === 'item')) ? 'h3' : tag;
                let style = elementConfig.style ?? '';
                let content = this.processValue(value, key);

                if(this.elementConfigMap[key].subLevel) {
                    content += this.processSublevelObject(elementConfig, value);
                }

                let elementHTML = (keys[i + 2] !== 'circle') ? `<${checkedTag} style="${style}" class="${key}-class">${content}</${checkedTag}>` : '';

                html += elementHTML;

                if (checkedTag === 'label' && keys[i + 2] !== 'circle' && keys[i + 1] !== 'display' && keys[i + 2] !== 'item') {
                    const properties = objectData['properties'];
                    const inputElement = properties ? this.processItemProperties(properties) : `<input type="text" style="width: 50vw;" class="item-input-class"/>`;
                    html += inputElement;
                }

                if (key === 'item' && keys[i - 1] === 'type') {
                    const addListItemButton = `<button onclick="${this.processObject(objectData[key])}" style="margin: 5px;"> + </button>`;
                    html += addListItemButton;
                }
            }
        }
        return html;
    }

    processSublevelObject(elementConfig, value) {
        const { tag, subLevel } = elementConfig;
        let subLevelHTML = '';

        // Generate sub-level elements
        if (typeof value === 'object') {
            for (const subKey in subLevel) {
                if (subLevel.hasOwnProperty(subKey)) {
                    if (value.hasOwnProperty(subKey)) {
                        const subValue = value[subKey];
                        const subTag = subLevel[subKey];
                        const subContent = this.processValue(subValue);
                        const subElementHTML = `<${subTag.tag}>${subContent}</${subTag.tag}>`;

                        subLevelHTML += subElementHTML;
                    }
                }
            }
        }

        return `<${tag}>${subLevelHTML}</${tag}>`;
    }

    // Process property value of JSON-object
    processValue(value, key) {
        let processedValue = '';

        if (Array.isArray(value)) {
            processedValue = this.processArray(value, key);
        } else if (typeof value === 'object') {
            if (value !== null) {
                processedValue = this.processObject(value);
            }
        } else if (typeof value === 'string' || typeof value === 'number') {
            processedValue = value;
        }

        return processedValue;
    }

    // Process array and generate corresponding HTML elements
    processArray(arrayData, key) {
        let html = '';

        for (const item of arrayData) {
            if (typeof item === 'object') {
                if (Array.isArray(item)) {
                    html += this.processArray(item);
                } else {
                    html += (key === 'item') ? `<div style="display: flex; flex-direction: row;">${this.processObject(item)}</div>`: `<div>${this.processObject(item)}</div>`;
                }
            }
        }
        return html;
    }

    // Process item properties and generate input elements corresponding to the labels
    processItemProperties(itemProperties) {
        const handleValueUnitCurrency = (value) => {
            for (const valueProperty in value) {
                const val = value[valueProperty];
                if (valueProperty === 'concatenation') {
                    for (const obj of val) {
                        for (const key in obj) {
                            itemValue += this.processArgument(key, obj[key]);
                        }
                    }
                } else {
                    itemValue += this.processArgument(valueProperty, val);
                }
            }
        };

        const propertyHandlers = {
            format: (value) => {
                if (value === 'textarea') {
                    return `<textarea rows="4" cols="50" style="width: 50vw;" class="item-input-class">${itemValue}</textarea>`;
                } else {
                    inputType = value;
                }
            },
            hidden: () => {
                inputType = 'hidden';
            },
            required: (value) => {
                itemRestrictions += `required="${value}" `;
            },
            readonly: (value) => {
                itemRestrictions += `readonly="${value}" `;
            },
            validation: (values) => {
                itemRestrictions += `pattern="${values.regEx[0].constant}"`
            },
            enum: (values) => {
                const options = values.map(value => `<option value="${value}" class="item-input-option-class">${value}</option>`).join('');
                inputElement = `<select class="item-input-class" style="width: 50vw;" ${itemRestrictions}>${options}</select>`;
            },
            value: (value) => {
                handleValueUnitCurrency(value);
            },
            unit: (value) => {
                handleValueUnitCurrency(value);
            },
            currency: (value) => {
                handleValueUnitCurrency(value);
            },
        };

        let inputType = 'text';
        let itemRestrictions = '';
        let itemValue = '';
        let inputElement = '';

        if (itemProperties === null) {
            return `<input type="${inputType}" style="width: 50vw;" class="item-input-class" ${itemRestrictions} value="${itemValue}"/>`;
        }

        for (const property in itemProperties) {
            if (propertyHandlers[property]) {
                propertyHandlers[property](itemProperties[property]);
            }
        }

        if (!inputElement.includes('textarea') && !inputElement.includes('select')) {
            inputElement += `<input type="${inputType}" style="width: 50vw;" class="item-input-class" ${itemRestrictions} value="${itemValue}"/>`;
        }

        return inputElement;
    }

    // Process arguments defining the value of the input elements
    processArgument(key, argumentValue) {
        if (key === 'constant') {
            return argumentValue;
        } else if (key === 'variable') {
            const date = new Date();
            if (argumentValue === 'systemDate' || argumentValue === 'today') {
                return date.toLocaleDateString('de-CH');
            } else if (argumentValue === 'year') {
                return date.getFullYear();
            }
        } else if(key === 'refItem'){
            // TODO: Handle input / lookup
            return '[refItem]';
        } else if(key === 'refItemNext') {

        }
    }

}

module.exports = JUIBuilder;