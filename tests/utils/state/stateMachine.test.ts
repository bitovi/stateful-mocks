import {
  getEntityInstance,
  StateMachine,
} from "../../../dist/utils/state/stateMachine";

const { statesData, stateMachine } = {
  statesData: {
    empty: null,
    created: {
      name: "Mrs. Quo",
      age: 19,
    },
    edited: {
      name: "Sr. Quo",
      age: 27,
    },
  },
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
};

const mockControllers = () => {
  return [
    {
      entity: "Person",
      instances: [
        {
          id: "quo",
          stateMachine: new StateMachine(statesData, stateMachine),
        },
      ],
    },
  ];
};
describe("getEntityInstance", () => {
  test("Returns correct entity instance by id", () => {
    const entityInstance = getEntityInstance(
      mockControllers(),
      "Person",
      "quo"
    );

    expect(entityInstance.interpreter.id).toBe("Person");
    expect(entityInstance.statesData).toEqual(statesData);
  });
});

describe("State Machine", () => {
  test("Returns current state for expected entity instance", () => {
    const entityInstance = getEntityInstance(
      mockControllers(),
      "Person",
      "quo"
    );

    expect(entityInstance.getCurrentState()).toEqual("empty");
  });

  test("Returns current state for expected entity instance after state transition", () => {
    const entityInstance = getEntityInstance(
      mockControllers(),
      "Person",
      "quo"
    );

    expect(entityInstance.getCurrentState()).toEqual("empty");
    entityInstance.send("create");
    expect(entityInstance.getCurrentState()).toEqual("created");
  });
  test("Returns state data for entity", () => {
    const entityInstance = getEntityInstance(
      mockControllers(),
      "Person",
      "quo"
    );

    expect(entityInstance.getStateData()).toEqual(undefined);
    expect(entityInstance.getStateData("created")).toEqual({
      name: "Mrs. Quo",
      age: 19,
    });
  });
  test("Returns current state data for expected entity after state transition", () => {
    const entityInstance = getEntityInstance(
      mockControllers(),
      "Person",
      "quo"
    );
    expect(entityInstance.getCurrentStateData()).toEqual(null);
    entityInstance.send("create");
    expect(entityInstance.getCurrentStateData()).toEqual({
      name: "Mrs. Quo",
      age: 19,
    });
  });
});
