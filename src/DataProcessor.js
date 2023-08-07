const he = require("he");

class DataProcessor {
    static elementConfigMap = '';
    static listCount = 0;

    // Process JSON object and generate HTML elements
    static processObject(objectData, elementConfigMap = null) {
        if(elementConfigMap !== null) {
            this.elementConfigMap = elementConfigMap;
        }
        let html = '';
        const keys = Object.keys(objectData);

        // Go through all keys on the current json data level
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];

            if (objectData.hasOwnProperty(key) && elementConfigMap.hasOwnProperty(key)) {
                const value = objectData[key];

                if (key === 'list') {
                    this.processList(value);
                }

                const elementConfig = elementConfigMap[key];
                html += this.processElement(elementConfig, value, keys, i, objectData);
            }
        }

        return html;
    }

    // Add index to list JSON data
    static processList(listData) {
        listData.forEach((itemData, index) => {
            itemData.index = index;
            this.listCount++;
        });
    }

    // Process element and generate its HTML
    static processElement(elementConfig, value, keys, currentIndex, objectData) {
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
    static processValue(value, key) {
        let processedValue = '';

        if (Array.isArray(value)) {
            processedValue = this.processArray(value, key);
        } else if (typeof value === 'object') {
            if (value !== null) {
                processedValue = this.processObject(value, this.elementConfigMap);
            }
        } else if (typeof value === 'string') {
            processedValue = he.encode(value);
        } else if(typeof value === 'number') {
            processedValue = value;
        }

        return processedValue;
    }

    // Process array and generate corresponding HTML elements
    static processArray(arrayData, key) {
        let html = '';
        for (const item of arrayData) {
            if (typeof item === 'object') {
                if (Array.isArray(item)) {
                    html += this.processArray(item);
                } else {
                    // Process items or other objects in array
                    html += (key === 'item') ? `<div style="display: flex; flex-direction: row;">${this.processObject(item, this.elementConfigMap)}</div>` : (item.hasOwnProperty('index')) ? `<div id="list-${item.index}">${this.processObject(item, this.elementConfigMap)}</div><button id="add-item-${item.index}" style="margin-top: 10px;"> + </button>` : `<div>${this.processObject(item, this.elementConfigMap)}</div>`;
                }
            }
        }
        return html;
    }

    // Process sublevel object and generate HTML
    static processSublevelObject(elementConfig, value) {
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
    static processInput(properties) {
        return properties ? this.processItemProperties(properties) : `<input type="text" style="width: 50vw;" class="item-input-class"/>`;
    }

    // Process item properties and generate input elements for labels
    static processItemProperties(itemProperties) {
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
    static handleValueUnitCurrency(value) {
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
    static processArgument(key, argumentValue) {
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
    static addButtonEventListener() {
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

module.exports = DataProcessor;