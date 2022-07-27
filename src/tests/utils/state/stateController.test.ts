import { getControllers } from "../../../utils/state/stateController";

describe("getControllers", () => {
  const cases = [
    {
      config: {
        entities: {
          Person: {
            stateMachine: {
              id: "Person",
              initial: "empty",
              states: {
                empty: {
                  on: {
                    create: "created",
                  },
                },
                created: {
                  on: {
                    edit: "edited",
                    delete: "empty",
                  },
                },
                edited: {
                  on: {
                    delete: "empty",
                  },
                },
              },
            },
            instances: {
              quo: {
                statesData: {
                  empty: {},
                  created: {
                    name: "Mrs. Quo",
                    age: 19,
                  },
                  edited: {
                    name: "Sr. Quo",
                    age: 27,
                  },
                },
              },
              di: {
                statesData: {
                  empty: {},
                  created: {
                    name: "Mrs. Di",
                    age: 22,
                  },
                  edited: {
                    name: "Sr. Di",
                    age: 34,
                  },
                },
              },
            },
          },
        },
        requests: [],
      },
      expectedResult: [
        {
          entity: "Person",
          instances: [
            {
              id: "quo",
              stateMachine: {
                interpreter: {
                  id: "quo",
                },
                statesData: {
                  empty: {},
                  created: {
                    name: "Mrs. Quo",
                    age: 19,
                  },
                  edited: {
                    name: "Sr. Quo",
                    age: 27,
                  },
                },
              },
            },
            {
              id: "di",
              stateMachine: {
                interpreter: {
                  id: "di",
                },
                statesData: {
                  empty: {},
                  created: {
                    name: "Mrs. Di",
                    age: 22,
                  },
                  edited: {
                    name: "Sr. Di",
                    age: 34,
                  },
                },
              },
            },
          ],
        },
      ],
      description:
        "Ensure getControllers returns two state machines, one for each entity instance",
    },
    {
      config: {
        entities: {
          Person: {
            stateMachine: {
              id: "Person",
              initial: "empty",
              states: {
                empty: {
                  on: {
                    create: "created",
                  },
                },
                created: {
                  on: {
                    edit: "edited",
                    delete: "empty",
                  },
                },
                edited: {
                  on: {
                    delete: "empty",
                  },
                },
              },
            },
            instances: {
              quo: {
                statesData: {
                  empty: {},
                  created: {
                    name: "Mrs. Quo",
                    age: 19,
                  },
                  edited: {
                    name: "Sr. Quo",
                    age: 27,
                  },
                },
              },
            },
          },
          Animal: {
            stateMachine: {
              id: "Animal",
              initial: "empty",
              states: {
                empty: {
                  on: {
                    create: "created",
                  },
                },
                created: {
                  on: {
                    edit: "edited",
                    delete: "empty",
                  },
                },
                edited: {
                  on: {
                    delete: "empty",
                  },
                },
              },
            },
            instances: {
              Dilma: {
                statesData: {
                  empty: {},
                  created: {
                    name: "Dilma",
                    age: 19,
                    breed: "German Shepherd",
                  },
                  edited: {
                    name: "Dilma, Fluffy Paws",
                    age: 20,
                    breed: "German Shepherd",
                  },
                },
              },
            },
          },
        },
        requests: [],
      },
      expectedResult: [
        {
          entity: "Person",
          instances: [
            {
              id: "quo",
              stateMachine: {
                interpreter: {
                  id: "quo",
                },
                statesData: {
                  empty: {},
                  created: {
                    name: "Mrs. Quo",
                    age: 19,
                  },
                  edited: {
                    name: "Sr. Quo",
                    age: 27,
                  },
                },
              },
            },
          ],
        },
        {
          entity: "Animal",
          instances: [
            {
              id: "Dilma",
              stateMachine: {
                interpreter: {
                  id: "Dilma",
                },
                statesData: {
                  empty: {},
                  created: {
                    name: "Dilma",
                    age: 19,
                    breed: "German Shepherd",
                  },
                  edited: {
                    name: "Dilma, Fluffy Paws",
                    age: 20,
                    breed: "German Shepherd",
                  },
                },
              },
            },
          ],
        },
      ],
      description:
        "Ensure getControllers returns multiple controllers, if more than one entity is set",
    },
  ];

  test.each(cases)(
    "$description",
    ({ config, expectedResult, description }) => {
      const mockedControllers = getControllers(config.entities);

      //todo: silly solution to jest bug (JSON.stringify then JSON.parse); fix it propertly.
      expect(JSON.parse(JSON.stringify(mockedControllers))).toEqual(
        expectedResult
      );
    }
  );
});
