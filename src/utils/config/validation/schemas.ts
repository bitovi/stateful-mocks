const stateSchema = [
  {
    type: "object",
    patternProperties: {
      "(.*?)": {
        type: "object",
        properties: {
          on: {
            type: "object",
            patternProperties: {
              "(.*?)": {
                type: "string",
              },
            },
          },
        },
        required: ["on"],
      },
    },
  },
  {
    type: "object",
    patternProperties: {
      "(.*?)": {},
    },
  },
];

const responseSchema = {
  type: "object",
  properties: {
    entity: {
      type: "string",
    },
    id: {
      type: "string",
    },
    state: {
      type: "string",
    },
  },
  required: ["entity", "id"],
};
const stateChangesSchema = {
  type: "array",
  items: [
    {
      type: "object",
      properties: {
        entity: {
          type: "string",
        },
        id: {
          type: "string",
        },
        event: {
          type: "string",
        },
      },
      required: ["entity", "id", "event"],
    },
  ],
};

export const schema = {
  type: "object",
  properties: {
    entities: {
      type: "object",
      patternProperties: {
        "(.*?)": {
          type: "object",
          properties: {
            stateMachine: {
              type: "object",
              properties: {
                initial: {
                  type: "string",
                },
                states: {
                  anyOf: stateSchema,
                },
              },
              required: ["initial", "states"],
            },
            instances: {
              type: "object",
              patternProperties: {
                "(.*?)": {
                  type: "object",
                  properties: {
                    statesData: {
                      type: "object",
                      patternProperties: {
                        "(.*?)": {
                          type: "object",
                          patternProperties: {
                            "(.*?)": {
                              type: [
                                "number",
                                "string",
                                "boolean",
                                "object",
                                "array",
                                "null",
                              ],
                            },
                          },
                        },
                      },
                    },
                  },
                  required: ["statesData"],
                },
              },
            },
          },
          required: ["stateMachine", "instances"],
        },
      },
    },
    requests: {
      type: "array",
      items: [
        {
          type: "object",
          properties: {
            body: {
              type: "string",
            },
            response: {
              anyOf: [
                responseSchema,
                {
                  type: "array",
                  items: responseSchema,
                },
              ],
            },
            stateChanges: stateChangesSchema,
          },
          required: ["response"],
        },
      ],
    },
  },
  required: ["entities", "requests"],
  additionalProperties: false,
};
