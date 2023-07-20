# JUIBuilder

The JUIBuilder is a JavaScript framework that provides a simple and customizable way to generate dynamic HTML content based on structured JSON data.

## Features

- Convert JSON data to HTML markup
- Define custom mapping between JSON keys and HTML elements
- Support for nested JSON objects and arrays
- Customizable class names and attributes for HTML elements
- Basic validation of JSON data against a JSON schema

## Installation

## Usage
Here is an example on how to use this framework: 
```
// (Optional) Define the element configuration map by matching the JSON properties of your data to HTML element references.
// The name of the element needs to match the name of the JSON-property. Per element you can define tag (HTML reference), style (CSS styling) and sublevel.
// Use sublevel if the JSON property has nested objects, which you want to style specifically. In the sublevel you can define tag and style.
const elementConfigMap = {
    age: {
        tag: 'h3'
        subLevel: {
            name: {
                tag: 'p'
            }
        }
    },
    lastName: {
        tag: 'p',
        style: 'padding: 10px;'
    },
};

// Create an instance of the JUIBuilder class (optionally with own elementConfigMap)
const converter = new JUIBuilder(elementConfigMap);

/* (Optional) Define your JSON schema
*/ Define your own JSON schema for the JSON data you want to convert to HTML. The JSON schema needs to follow the 2020-12 schema standard. 
const jsonSchemaOne = {
    "$id": "https://example.com/person.schema.json",
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "title": "Person",
    "type": "object",
    "properties": {
        "firstName": {
            "type": "string",
            "description": "The person's first name."
        },
        "lastName": {
            "type": "string",
            "description": "The person's last name."
        },
        "age": {
            "description": "Age in years which must be equal to or greater than zero.",
            "type": "integer",
            "minimum": 0
        }
    }
};

// Define your JSON data which you want to convert to 
const example = {
    "firstName": "John",
    "lastName": "Doe",
    "age": 21
};

// Convert the JSON data to HTML (optional with own jsonSchema)
const html = converter.processEventData(jsonData, jsonSchema);

// Output the generated HTML
console.log(html);
```

## Contribution

## License 
