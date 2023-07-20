const JSONToHTMLConverter = require('./JUIBuilder.js');

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

const elementConfigMap = {
    age: 'h3',
    lastName: 'p'
};


const exampleOne = {
    "firstName": "John",
    "lastName": "Doe",
    "age": 21
};

const exampleTwo = {
    "name": 21,
};

const exampleThree = {
        "authorization": [
            {
                "role": "Projektverantwortlicher",
                "activity": "edit"
            }
        ],
        "identity": {
            "name": "createInvoice",
            "designation": "Rechnung stellen",
            "description": "Hier erstellst du eine Abschluss- oder auch Zwischenrechnung für ein Projekts. \nGeneriere eine Rechnung an deine Kunden, die sich automatisch aus den verbuchten Projektleistungen (Eigen- wie Fremdleistungen), den hinterlegten Zahlungskonditionen (Rabattklassen, Einzel- oder Sammelrechnung u.ä.) der Kund*in, den bereits erbrachten Zahlungen (Vorauszahlung, Zwischenrechnungen usw.) und den ggf. getroffenen Sondervereinbarungen zusammensetzt.",
            "circle": "Purpose",
            "domain": "Accounting"
        },
        "input": {
            "class": [
                {
                    "name": "project",
                    "selection": "project"
                },
                {
                    "name": "projectHours",
                    "destination": "project.projectHours"
                },
                {
                    "name": "thirdPartyCost",
                    "destination": "project.thirdPartyCost"
                }
            ]
        },
        "output": {
            "class": [
                {
                    "name": "invoice",
                    "designation": "Rechnung",
                    "display": [
                        {
                            "type": "list",
                            "refItem": [
                                "date",
                                "invoiceId"
                            ]
                        }
                    ],
                    "item": [
                        {
                            "name": "invoiceId",
                            "designation": "Rechnung Nr.",
                            "type": "string",
                            "properties": {
                                "required": true,
                                "unique": true,
                                "value": {
                                    "concatenation": [
                                        {
                                            "constant": "RE"
                                        },
                                        {
                                            "constant": " "
                                        },
                                        {
                                            "variable": "year"
                                        },
                                        {
                                            "refItemNext": {
                                                "refItem": "invoiceId",
                                                "offset": "7,4",
                                                "type": "table",
                                                "step": 1,
                                                "base": 0
                                            }
                                        }
                                    ]
                                }
                            }
                        },
                        {
                            "name": "date",
                            "designation": "Rechnungsdatum",
                            "type": "date"
                        }
                    ],
                    "list": [
                        {
                            "name": "projectHours",
                            "designation": "Projektstunden",
                            "type": "array",
                            "item": [
                                {
                                    "name": "projectHours",
                                    "designation": "Projektstunden",
                                    "type": "object",
                                    "refClass": "projectHours",
                                    "properties": {
                                        "unique": true
                                    }
                                },
                                {
                                    "name": "activity",
                                    "designation": "Tätigkeit",
                                    "type": "object",
                                    "refClass": "activity"
                                },
                                {
                                    "name": "description",
                                    "designation": "Beschreibung",
                                    "type": "string",
                                    "refItem": "activity",
                                    "properties": {
                                        "value": {
                                            "refItem": "$input.description"
                                        },
                                        "format": "textarea"
                                    }
                                },
                                {
                                    "name": "quantity",
                                    "designation": "Menge",
                                    "type": "number",
                                    "properties": {
                                        "decimals": 1,
                                        "unit": {
                                            "refItem": "unit"
                                        }
                                    }
                                },
                                {
                                    "name": "price",
                                    "designation": "Preis pro Stunde",
                                    "type": "number",
                                    "properties": {
                                        "decimals": 2,
                                        "currency": {},
                                        "value": {
                                            "refItem": "$input.price"
                                        }
                                    }
                                }
                            ]
                        },
                        {
                            "name": "thirdPartyCost",
                            "designation": "Fremdkosten",
                            "type": "array",
                            "item": [
                                {
                                    "name": "thirdPartyCost",
                                    "designation": "Fremdkosten",
                                    "type": "object",
                                    "refClass": "thirdPartyCost",
                                    "properties": {
                                        "unique": true
                                    }
                                },
                                {
                                    "name": "description",
                                    "designation": "Beschreibung",
                                    "type": "string",
                                    "refItem": "thirdPartyCost",
                                    "properties": {
                                        "value": {
                                            "refItem": "$input.description"
                                        },
                                        "format": "textarea"
                                    }
                                },
                                {
                                    "name": "quantity",
                                    "designation": "Menge",
                                    "type": "number",
                                    "properties": {
                                        "decimals": 1,
                                        "unit": {
                                            "refItem": "unit"
                                        }
                                    }
                                },
                                {
                                    "name": "unit",
                                    "designation": "Einheit",
                                    "type": "object",
                                    "refClass": "unit",
                                    "properties": {
                                        "value": {
                                            "refItem": "$input.unit"
                                        }
                                    }
                                },
                                {
                                    "name": "price",
                                    "designation": "Preis",
                                    "type": "number",
                                    "properties": {
                                        "decimals": 2,
                                        "currency": {},
                                        "value": {
                                            "refItem": "$input.price"
                                        }
                                    }
                                }
                            ]
                        }
                    ]
                }
            ]
        },
        "result": {
            "resultDef": [
                {
                    "template": "Rechnung",
                    "service": "pdf",
                    "transport": {
                        "destinationItem": "invoice.customer.contact.email",
                        "type": "email"
                    }
                }
            ]
        },
        "state": {
            "direction": "Purpose",
            "task": "Compensation",
            "step": "Preparation"
        },
        "trigger": {
            "startOn": [
                {
                    "type": "Manual"
                }
            ]
        },
        "validity": {}
    };

const exampleFour = {
    "authorization": [
        {
            "role": "Projektverantwortlicher",
            "activity": "edit"
        },
        {
            "role": "Mitarbeiter",
            "activity": "view"
        }
    ],
    "identity": {
        "name": "maintainProject",
        "designation": "Projekt bearbeiten",
        "description": "Hier erstellst du Projekte, die ohne einen Umweg über „Angebot erstellen“ direkt freigegeben werden können. \nEröffne Projekte, die mit Kunden schon umfassend mündlich abgesprochen wurden oder bei denen du auf eine Auftragsbestätigung verzichten möchtest. Die Projekte können in der Folge direkt zur Bearbeitung freigegeben werden.",
        "circle": "Purpose",
        "domain": "Projektabwicklung"
    },
    "input": {
        "class": [
            {
                "name": "customer"
            }
        ]
    },
    "output": {
        "class": [
            {
                "name": "project",
                "designation": "Projekt",
                "display": [
                    {
                        "type": "list",
                        "refItem": [
                            "projectId",
                            "designation",
                            "customer"
                        ]
                    }
                ],
                "item": [
                    {
                        "name": "projectId",
                        "designation": "Projekt",
                        "type": "string",
                        "properties": {
                            "required": true,
                            "unique": true,
                            "hint": "Nummer",
                            "value": {
                                "concatenation": [
                                    {
                                        "constant": "PR"
                                    },
                                    {
                                        "constant": " "
                                    },
                                    {
                                        "variable": "year"
                                    },
                                    {
                                        "refItemNext": {
                                            "refItem": "projectId",
                                            "offset": "7,4",
                                            "type": "table",
                                            "step": 1,
                                            "base": 0
                                        }
                                    }
                                ]
                            }
                        }
                    },
                    {
                        "name": "offer",
                        "designation": "Angebot",
                        "type": "object",
                        "refClass": "offer",
                        "asInput": true
                    },
                    {
                        "name": "designation",
                        "designation": "Bezeichnung",
                        "type": "string"
                    },
                    {
                        "name": "description",
                        "designation": "Beschreibung",
                        "type": "string",
                        "properties": {
                            "format": "textarea"
                        }
                    },
                    {
                        "name": "start",
                        "designation": "Start",
                        "type": "date"
                    },
                    {
                        "name": "end",
                        "designation": "Ende",
                        "type": "date"
                    }
                ],
                "list": [
                    {
                        "name": "position",
                        "designation": "Projektposition",
                        "type": "array",
                        "item": [
                            {
                                "name": "activity",
                                "designation": "Tätigkeit",
                                "type": "object",
                                "refClass": "activity",
                                "properties": {
                                    "required": true,
                                    "unique": true
                                }
                            },
                            {
                                "name": "description",
                                "designation": "Beschreibung",
                                "type": "string",
                                "refItem": "activity",
                                "properties": {
                                    "value": {
                                        "refItem": "activity.description"
                                    },
                                    "format": "textarea"
                                }
                            },
                            {
                                "name": "quantity",
                                "designation": "Menge",
                                "type": "number",
                                "properties": {
                                    "decimals": 1,
                                    "unit": {
                                        "refItem": "unit"
                                    }
                                }
                            },
                            {
                                "name": "unit",
                                "designation": "Einheit",
                                "type": "object",
                                "refItem": "activity",
                                "refClass": "unit"
                            },
                            {
                                "name": "price",
                                "designation": "Preis",
                                "type": "number",
                                "refItem": "activity",
                                "properties": {
                                    "decimals": 2,
                                    "currency": {},
                                    "value": {
                                        "refItem": "activity.price"
                                    }
                                }
                            }
                        ]
                    }
                ]
            }
        ],
        "approval": [
            {
                "refRole": [
                    "Projektverantwortlicher"
                ]
            }
        ]
    },
    "state": {
        "direction": "Purpose",
        "task": "Agreement",
        "step": "Execution"
    },
    "trigger": {
        "startOn": [
            {
                "type": "Manual"
            }
        ]
    },
    "validity": {}
};

const exampleFive = {
    "authorization": [
        {
            "role": "Projektverantwortlicher",
            "activity": "edit"
        }
    ],
    "identity": {
        "name": "createOffer",
        "designation": "Angebot erstellen",
        "description": "Hier erstellst du einen Projektentwurf, der der Kund*in als Angebot vorgelegt wird. \nGeneriere ein virtuelles Projekt, das bereits alle (geschätzten) Leistungen, samt Preisen enthält, um der Kund*in eine Entscheidungsgrundlage zukommen lassen zu können, die nach erfolgter Bestätigung durch die Kund*in zugleich die Grundlage des daraus resultierenden Arbeitsauftrags bildet.",
        "circle": "Purpose",
        "domain": "Projektabwicklung"
    },
    "output": {
        "class": [
            {
                "name": "offer",
                "designation": "Angebot",
                "display": [
                    {
                        "type": "list",
                        "refItem": [
                            "offerId",
                            "validToDate",
                            "customer"
                        ]
                    }
                ],
                "item": [
                    {
                        "name": "offerId",
                        "designation": "Nummer",
                        "type": "string",
                        "properties": {
                            "required": true,
                            "unique": true,
                            "value": {
                                "concatenation": [
                                    {
                                        "constant": "OF"
                                    },
                                    {
                                        "constant": " "
                                    },
                                    {
                                        "variable": "year"
                                    },
                                    {
                                        "refItemNext": {
                                            "refItem": "offer",
                                            "offset": "7,4",
                                            "type": "table",
                                            "step": 1,
                                            "base": 0
                                        }
                                    }
                                ]
                            }
                        }
                    },
                    {
                        "name": "customer",
                        "designation": "Kunde",
                        "type": "object",
                        "refClass": "customer"
                    },
                    {
                        "name": "designation",
                        "designation": "Bezeichnung",
                        "type": "string"
                    },
                    {
                        "name": "description",
                        "designation": "Beschreibung",
                        "type": "string",
                        "properties": {
                            "format": "textarea"
                        }
                    },
                    {
                        "name": "creationDate",
                        "designation": "Erstellungsdatum",
                        "type": "date",
                        "properties": {
                            "value": {
                                "variable": "systemDate"
                            }
                        }
                    },
                    {
                        "name": "validToDate",
                        "designation": "Gültig bis",
                        "type": "date"
                    }
                ],
                "list": [
                    {
                        "name": "position",
                        "designation": "Angebotsposition",
                        "type": "array",
                        "item": [
                            {
                                "name": "activity",
                                "designation": "Tätigkeit",
                                "type": "object",
                                "refClass": "activity",
                                "properties": {
                                    "required": true,
                                    "unique": true
                                }
                            },
                            {
                                "name": "description",
                                "designation": "Beschreibung",
                                "type": "string",
                                "refItem": "activity",
                                "properties": {
                                    "value": {
                                        "refItem": "activity.description"
                                    },
                                    "format": "textarea"
                                }
                            },
                            {
                                "name": "quantity",
                                "designation": "Menge",
                                "type": "number",
                                "properties": {
                                    "decimals": 1,
                                    "unit": {
                                        "refItem": "unit"
                                    }
                                }
                            },
                            {
                                "name": "unit",
                                "designation": "Einheit",
                                "type": "object",
                                "refItem": "activity",
                                "refClass": "unit"
                            },
                            {
                                "name": "price",
                                "designation": "Preis",
                                "type": "number",
                                "refItem": "activity",
                                "properties": {
                                    "decimals": 2,
                                    "currency": {},
                                    "value": {
                                        "refItem": "activity.price"
                                    }
                                }
                            }
                        ]
                    }
                ]
            }
        ]
    },
    "result": {
        "resultDef": [
            {
                "template": "Angebot",
                "service": "pdf",
                "transport": {
                    "destinationItem": "offer.project.customer.contact.email",
                    "type": "email"
                }
            }
        ]
    },
    "state": {
        "direction": "Purpose",
        "task": "Agreement",
        "step": "Preparation"
    },
    "trigger": {
        "startOn": [
            {
                "type": "Manual"
            }
        ]
    },
    "validity": {}
};

const exampleSix = {
    "identity": {
        "name": "openOwner",
        "designation": "Grunddaten Eigner erfassen",
        "description": "Grund- und Steuerungsdaten des Mandanteneigners.",
        "circle": "Asset",
        "domain": "Admin"
    },
    "validity": {},
    "trigger": {},
    "input": {},
    "output": {
        "class": [
            {
                "name": "owner",
                "designation": "Eigner",
                "display": [
                    {
                        "type": "list",
                        "refItem": [
                            "name"
                        ]
                    }
                ],
                "item": [
                    {
                        "name": "name",
                        "designation": "Name",
                        "type": "string"
                    },
                    {
                        "name": "paymentTerm",
                        "designation": "Zahlungskondition",
                        "type": "string"
                    },
                    {
                        "name": "phoneNumber",
                        "designation": "Tel.Nr.",
                        "type": "string",
                        "properties": {
                            "format": "tel",
                            "validation": {
                                "regEx": [
                                    {
                                        "constant": "/^([0][1-9][0-9](\\s|)[0-9][0-9][0-9](\\s|)[0-9][0-9](\\s|)[0-9][0-9])$|^(([0][0]|\\+)[1-9][0-9](\\s|)[0-9][0-9](\\s|)[0-9][0-9][0-9](\\s|)[0-9][0-9](\\s|)[0-9][0-9])$/"
                                    }
                                ]
                            }
                        }
                    },
                    {
                        "name": "email",
                        "designation": "E-Mail",
                        "type": "string",
                        "properties": {
                            "format": "email"
                        }
                    },
                    {
                        "name": "vatNo",
                        "designation": "MwSt Nummer",
                        "type": "string"
                    },
                    {
                        "name": "currency",
                        "designation": "Währung",
                        "type": "object",
                        "refClass": "currency",
                        "properties": {
                            "value": {
                                "constant": "CHF"
                            }
                        }
                    }
                ],
                "list": [
                    {
                        "name": "address",
                        "designation": "Adresse",
                        "type": "object",
                        "item": [
                            {
                                "name": "street",
                                "designation": "Strasse",
                                "type": "string"
                            },
                            {
                                "name": "houseNo",
                                "designation": "Hausnummer",
                                "type": "string"
                            },
                            {
                                "name": "addressAddition",
                                "designation": "Zusatz",
                                "type": "string"
                            },
                            {
                                "name": "poBox",
                                "designation": "Postfach",
                                "type": "string"
                            },
                            {
                                "name": "postcode",
                                "designation": "Postleitzahl",
                                "type": "string"
                            },
                            {
                                "name": "location",
                                "designation": "Ort",
                                "type": "string"
                            },
                            {
                                "name": "country",
                                "designation": "Land",
                                "type": "object",
                                "refClass": "country"
                            }
                        ]
                    },
                    {
                        "name": "bank",
                        "designation": "Bankverbindung",
                        "type": "object",
                        "item": [
                            {
                                "name": "name",
                                "designation": "Name",
                                "type": "string"
                            },
                            {
                                "name": "postcode",
                                "designation": "Postleitzahl",
                                "type": "string"
                            },
                            {
                                "name": "location",
                                "designation": "Ort",
                                "type": "string"
                            },
                            {
                                "name": "iban",
                                "designation": "IBAN",
                                "type": "string",
                                "properties": {
                                    "validation": {
                                        "service": "validateIBAN",
                                        "regEx": [
                                            {
                                                "constant": "CH[a-zA-Z0-9]{2}\\s?([0-9]{4}\\s?){1}([0-9]{1})([a-zA-Z0-9]{3}\\s?)([a-zA-Z0-9]{4}\\s?){2}([a-zA-Z0-9]{1})\\s?"
                                            }
                                        ]
                                    }
                                }
                            }
                        ]
                    }
                ]
            }
        ]
    },
    "state": {
        "direction": "Asset",
        "task": "Information",
        "step": "Execution"
    }
};

const converter = new JSONToHTMLConverter();

/*let htmlMarkup = converter.processEventData(exampleOne, jsonSchemaOne);
console.log(htmlMarkup);
console.log('------------------------------------------------------');*/

let htmlMarkup = converter.processEventData(exampleThree);
console.log(htmlMarkup);
//htmlMarkup = converter.processEventData(exampleTwo, jsonSchema);
//console.log(htmlMarkup);