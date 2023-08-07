const {JSDOM} = require('jsdom');
const dom = new JSDOM('<!DOCTYPE html>');
const {document} = dom.window;
const beautify = require('js-beautify').html;
const he = require('he');

class HtmlUtils {
    // Check validity of html in elementConfigMap
    static validateHtml(configMap) {
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
    static validateHtmlTag(tag) {
        try {
            const testElement = document.createElement(tag);
            return testElement.toString() !== '[object HTMLUnknownElement]';
        } catch (error) {
            console.error('Error occurred while creating HTML element with the tag ' + tag + ': ' + error.message);
            return false;
        }
    }

    // Check validity of CSS styling
    static validateStyling(style) {
        try {
            const testElement = document.createElement('div');
            return (testElement.style.cssText = style) === style;
        } catch (error) {
            console.error('Error occurred while testing CSS: ' + error.message);
            return false;
        }
    }

    // Check and remove if HTML element is undefined or empty
    static removeUndefinedOrEmptyElements(htmlMarkup) {
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

    // Return beautified HTML markup
    static processHtmlMarkup(htmlMarkup) {
        return beautify(this.removeUndefinedOrEmptyElements(htmlMarkup)).replace(/[\u0080-\u00A5\u00B5-\u00B7\u00BD\u00BE\u00C6\u00C7\u00D0-\u00D8\u00DE\u00E0-\u00ED\u00F6\u00FC]/g, (char) => he.encode(char));
    }
}

module.exports = HtmlUtils;
