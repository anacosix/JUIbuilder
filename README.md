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
// (Optional) Define the element configuration map by matching the JSON properties of your data to HTML elements
const elementConfigMap = {
  identity: {
    tag: 'div',
    subLevel: {
      designation: 'h2',
      description: 'p'
    }
  },
  output: 'div',
  list: 'div',
  item: 'div',
  designation: 'label',
  class: ''
};

// Create an instance of the JUIBuilder class (optionally with own elementConfigMap)
const converter = new JUIBuilder(elementConfigMap);

/* (Optional) Define your JSON schema
* Use HTML element references to define the appearence 
* for properties depending on their toplevel object, use 'subLevel'
*/ properties marked as 'label' will have an input element added to them
const jsonSchema = {
  id: 'p',
  batters: { 
    tag: 'div'
    subLevel: {
        batter: 'list'
    }
  }
};

// Define your jsonData
const jsonData = {
	"id": "0001",
	"type": "donut",
	"name": "Cake",
	"ppu": 0.55,
	"batters":
		{
			"batter":
				[
					{ "id": "1001", "type": "Regular" },
					{ "id": "1002", "type": "Chocolate" },
					{ "id": "1003", "type": "Blueberry" },
					{ "id": "1004", "type": "Devil's Food" }
				]
		},
	"topping":
		[
			{ "id": "5001", "type": "None" },
			{ "id": "5002", "type": "Glazed" },
			{ "id": "5005", "type": "Sugar" },
			{ "id": "5007", "type": "Powdered Sugar" },
			{ "id": "5006", "type": "Chocolate with Sprinkles" },
			{ "id": "5003", "type": "Chocolate" },
			{ "id": "5004", "type": "Maple" }
		]
};

// Convert the JSON data to HTML (optional with own jsonSchema)
const html = converter.processEventData(jsonData, jsonSchema);

// Output the generated HTML
console.log(html);
```

## Contribution

## License 
