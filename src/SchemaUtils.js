const Ajv = require('ajv/dist/2020');
const addFormats = require('ajv-formats');
const schemaJson = require('../assets/data/schema.json');

class SchemaUtils {
    // Check validity of provided JSON data based on JSON schema and syntax
    static validateSchema(data, schema, jsonSchema, elementConfigMap) {
        let schemaJsonData = this.prepareSchema(schema, jsonSchema, elementConfigMap);
        return this.validateData(data, schemaJsonData);
    }

    // Prepare JSON schema for validation
    static prepareSchema(schema, jsonSchema, elementConfigMap) {
        if (elementConfigMap === null) {
            console.error('The elementConfigMap must contain valid HTML tags and styles.');
        }

        if (schema !== null) {
            this.disallowAdditionalProperties(schema);
            return schema;
        }

        if (jsonSchema === null || jsonSchema === '') {
            return schemaJson;
        }
    }

    // Disallow additional properties in the JSON schema
    static disallowAdditionalProperties(schema) {
        if (schema.type === 'object') {
            schema.additionalProperties = false;
        }

        for (const key in schema.properties) {
            this.disallowAdditionalProperties(schema.properties[key]);
        }
    }

    // Validate JSON data against the JSON schema
    static validateData(data, jsonSchema) {
        const ajv = new Ajv({ strict: false });
        addFormats(ajv);
        const validate = ajv.compile(jsonSchema);
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

}

module.exports = SchemaUtils;
