const schemaJson = require('../assets/data/schema.json');
const elementConfigMapDefault = require('../assets/data/elementConfigMap.json');
const Ajv = require('ajv/dist/2020');
const addFormats = require("ajv-formats");
const beautify = require('js-beautify').html;
const {JSDOM} = require('jsdom');
const dom = new JSDOM('<!DOCTYPE html>');
const {document} = dom.window;
const he = require('he');

class JUIBuilder {
    // Constructor for JUIBuilder class
    constructor(elementConfigMap = null) {
        this.jsonSchema = '';
        this.listCount = 0;

        // Set default element config or from the input
        this.elementConfigMap = (elementConfigMap === null) ? elementConfigMapDefault : this.validateHtml(elementConfigMap) ? elementConfigMap : null;
    }

    // Check validity of html in elementConfigMap
    validateHtml(configMap) {
        for (const key in configMap) {
            if (!configMap.hasOwnProperty(key)) {
                continue;
            }

            const value = configMap[key];

            if (typeof value !== 'object' || !value.hasOwnProperty('tag')) {
                continue;
            }

            if (!this.validateHtmlTag(value.tag)) {
                console.error(value.tag + ' is not a valid HTML element.');
                return false;
            }

            if (value.hasOwnProperty('style') && !this.validateStyling(value.style)) {
                console.error(value.style + ' is not valid CSS.');
                return false;
            }
        }
        return true;
    }

    // Check validity of the HTML tag
    validateHtmlTag(tag) {
        try {
            const testElement = document.createElement(tag);
            return testElement.toString() !== '[object HTMLUnknownElement]';
        } catch (error) {
            console.error('Error occurred while creating HTML element with the tag ' + tag + ': ' + error.message);
            return false;
        }
    }

    // Check validity of CSS styling
    validateStyling(style) {
        try {
            const testElement = document.createElement('div');
            return (testElement.style.cssText = style) === style;
        } catch (error) {
            console.error('Error occurred while testing CSS: ' + error.message);
            return false;
        }
    }

    // Check validity of provided JSON data based on JSON schema and syntax
    validateSchema(data, schema = null) {
        this.prepareSchema(schema);
        return this.validateData(data);
    }

    // Prepare JSON schema for validation
    prepareSchema(schema) {
        if (this.elementConfigMap === null) {
            console.error('The elementConfigMap must contain valid HTML tags and styles.');
        }

        if (schema !== null) {
            this.jsonSchema = schema;
            this.disallowAdditionalProperties(this.jsonSchema);
        }

        if (this.jsonSchema === null || this.jsonSchema === '') {
            this.jsonSchema = schemaJson;
        }
    }

    // Disallow additional properties in the JSON schema
    disallowAdditionalProperties(schema) {
        if (schema.type === 'object') {
            schema.additionalProperties = false;
        }

        for (const key in schema.properties) {
            this.disallowAdditionalProperties(schema.properties[key]);
        }
    }

    // Validate JSON data against the JSON schema
    validateData(data) {
        const ajv = new Ajv({strict: false});
        addFormats(ajv);
        const validate = ajv.compile(this.jsonSchema);
        const valid = validate(data);

        if (!valid) {
            console.error('The JSON object is not valid against the defined event JSON schema.');
            console.log(validate.errors);
            return false;
        }

        if (typeof data !== 'object' || Array.isArray(data) || data === null) {
            console.error('The input must be a valid JSON object.');
            return false;
        }

        return true;
    }

    removeUndefinedOrEmptyElements(htmlMarkup) {
        const tempMarkup = document.createElement('div');
        tempMarkup.innerHTML = htmlMarkup;

        // remove empty divs and divs with value undefined
        const divElements = tempMarkup.querySelectorAll('div');
        divElements.forEach((divElement) => {
            if (divElement.textContent.trim() === '' || divElement.textContent.trim().toLowerCase() === 'undefined') {
                divElement.remove();
            }
        });

        // remove undefined elements
        const undefinedElements = tempMarkup.querySelectorAll('undefined');
        undefinedElements.forEach((element) => {
            element.remove();
        });

        return tempMarkup.innerHTML;
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
                                        ${this.processObject(jsonData)}
                                        ${this.listCount !== 0 ? this.addButtonEventListener() : ''}
                                      <hr>
                                      <input id="submitFormInput" type="submit" value="Speichern">
                                    </form>
                                  </body>
                                </html>`;

        return beautify(this.removeUndefinedOrEmptyElements(processedHtml)).replace(/[\u0080-\u00A5\u00B5-\u00B7\u00BD\u00BE\u00C6\u00C7\u00D0-\u00D8\u00DE\u00E0-\u00ED\u00F6\u00FC]/g, (char) => he.encode(char));
    }

    // Process JSON object and generate HTML elements
    processObject(objectData) {
        let html = '';
        const keys = Object.keys(objectData);

        // Go through all keys on the current json data level
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];

            if (objectData.hasOwnProperty(key) && this.elementConfigMap.hasOwnProperty(key)) {
                const value = objectData[key];

                if (key === 'list') {
                    this.processList(value);
                }

                const elementConfig = this.elementConfigMap[key];
                html += this.processElement(elementConfig, value, keys, i, objectData);
            }
        }

        return html;
    }

    // Add index to list JSON data
    processList(listData) {
        listData.forEach((itemData, index) => {
            itemData.index = index;
            this.listCount++;
        });
    }

    // Process element and generate its HTML
    processElement(elementConfig, value, keys, currentIndex, objectData) {
        const key = keys[currentIndex];
        let tag = elementConfig.tag ?? 'div';
        let checkedTag = (tag === 'label' && (keys[currentIndex + 1] === 'display' || keys[currentIndex + 2] === 'item')) ? 'h3' : tag;
        let style = elementConfig.style ?? '';
        let content = this.processValue(value, key);

        // Check if a sublevel is defined for the current key in the elementConfigMap
        if (elementConfig.subLevel) {
            // Process sublevel
            content += this.processSublevelObject(elementConfig, value);
        }

        let elementHTML = (keys[currentIndex + 2] !== 'circle') ? `<${checkedTag} style="${style}" class="${elementConfig.hasOwnProperty('class') ? elementConfig.class.valueOf() : key + '-class'}">${content}</${checkedTag}>` : '';

        if (checkedTag === 'label' && keys[currentIndex + 2] !== 'circle' && keys[currentIndex + 1] !== 'display' && keys[currentIndex + 2] !== 'item') {
            elementHTML += this.processInput(objectData['properties']);
        }

        return elementHTML;
    }

    // Process value of JSON object or array
    processValue(value, key) {
        let processedValue = '';

        if (Array.isArray(value)) {
            processedValue = this.processArray(value, key);
        } else if (typeof value === 'object') {
            if (value !== null) {
                processedValue = this.processObject(value);
            }
        } else if (typeof value === 'string') {
            processedValue = he.encode(value);
        } else if(typeof value === 'number') {
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
                    // Process items or other objects in array
                    html += (key === 'item') ? `<div style="display: flex; flex-direction: row;">${this.processObject(item)}</div>` : (item.hasOwnProperty('index')) ? `<div id="list-${item.index}">${this.processObject(item)}</div><button id="add-item-${item.index}" style="margin-top: 10px;"> + </button>` : `<div>${this.processObject(item)}</div>`;
                }
            }
        }
        return html;
    }

    // Process sublevel object and generate HTML
    processSublevelObject(elementConfig, value) {
        const {tag, subLevel} = elementConfig;
        let subLevelHTML = '';

        // Generate sub-level elements
        if (typeof value === 'object') {
            for (const subKey in subLevel) {
                if (subLevel.hasOwnProperty(subKey)) {
                    if (value.hasOwnProperty(subKey)) {
                        const subValue = value[subKey];
                        const subTag = subLevel[subKey].tag;
                        const subContent = this.processValue(subValue);
                        const subElementHTML = `<${subTag}>${subContent}</${subTag}>`;

                        subLevelHTML += subElementHTML;
                    }
                }
            }
        }

        return `<${tag}>${subLevelHTML}</${tag}>`;
    }

    // Process input elements
    processInput(properties) {
        return properties ? this.processItemProperties(properties) : `<input type="text" style="width: 50vw;" class="item-input-class"/>`;
    }

    // Process item properties and generate input elements for labels
    processItemProperties(itemProperties) {
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
            required: () => {
                itemRestrictions += `required `;
            },
            readonly: (value) => {
                itemRestrictions += `readonly="${value}" `;
            },
            validation: (values) => {
                itemRestrictions += `pattern="${values.regEx[0].constant}" `
            },
            decimals: (value) => {
                let decimals = '';
                for (let i = 0; i < value - 1; i++) {
                    decimals += '0';
                }
                itemRestrictions += `step="0.${decimals}1" `
            },
            enum: (values) => {
                const options = values.map(value => `<option value="${value}" class="item-input-option-class">${value}</option>`).join('');
                inputElement = `<select class="item-input-class" style="width: 50vw;" ${itemRestrictions}>${options}</select>`;
            },
            value: (value) => {
                itemValue = this.handleValueUnitCurrency(value);
            },
            unit: (value) => {
                itemValue = this.handleValueUnitCurrency(value);
            },
            currency: (value) => {
                itemValue = this.handleValueUnitCurrency(value);
            }
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

        // Handle item properties of input element not of type textarea or select
        if (!inputElement.includes('textarea') && !inputElement.includes('select')) {
            inputElement += `<input type="${inputType}" style="width: 50vw;" class="item-input-class" ${itemRestrictions} value="${itemValue}"/>`;
        }

        return inputElement;
    }

    // Handle value, unit and currency calls
    handleValueUnitCurrency(value) {
        let itemValue = '';
        for (const valueProperty in value) {
            const val = value[valueProperty];
            if (val !== 'undefined') {
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
        }
        return itemValue;
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
        } else if (key === 'refItem' || key === 'refItemNext' || key === 'lookup') {
            return `[${key.valueOf()}: ${typeof argumentValue === "object" ? argumentValue.refItem : argumentValue}]`;
        } else {
            return '';
        }
    }

    // Add event listeners to the list buttons
    addButtonEventListener() {
        let buttonEventListeners = '';
        for (let i = 0; i < this.listCount; i++) {
            buttonEventListeners += `document.getElementById("add-item-${i}").addEventListener("click", addItem);`;
        }

        // Handle adding new list item in DOM
        return `<script class="script-class">
                                function extractNumFromString(value) {
                                    return value.replace(/\\\D/g, '');
                                }
        
                                function addItem(event) {
                                    debugger;
                                    event.preventDefault();
                                   
                                    // Get first div of target list, clone it and append it to the list
                                    const targetList = document.getElementById("list-" + extractNumFromString(event.currentTarget.id));
                                    const firstDiv = targetList.querySelector("div");
                                    const newItem = firstDiv.cloneNode(true);
           
                                    const inputElements = newItem.querySelectorAll("input");
                                    inputElements.forEach((input) => {
                                        input.value = '';
                                    });
  
                                    targetList.appendChild(newItem);
                                }
                                
                                ${buttonEventListeners}
                            </script>`
    }
}

module.exports = JUIBuilder;