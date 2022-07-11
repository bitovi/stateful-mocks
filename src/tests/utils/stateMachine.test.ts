import { getEntityInstance } from "../../utils/state/stateMachine";

//TODO: Move mocks into separate file
const mockStateMachineParams = () => ({
  statesData: {
    empty: null,
    created: {
      id: "valid-id",
      name: "valid-name",
      age: 0,
    },
  },
  stateMachine: {
    id: "valid-id",
    initial: "empty",
    states: {
      empty: {
        on: {
          create: "created",
        },
      },
      created: {},
    },
  },
});
const { statesData, stateMachine } = mockStateMachineParams();
const mockStateController = () => [
  {
    entity: "valid-entity",
    instances: [
      {
        id: "valid-entity-instance-id",
        stateMachine: mockStateMachineParams(),
      },
    ],
  },
];

describe("getEntityInstance", () => {
  test("Returns correct instance", () => {
    const mockedControllers = mockStateController();
    const entityInstance = getEntityInstance(
      mockedControllers,
      "valid-entity",
      "valid-entity-instance-id"
    );

    expect(entityInstance.statesData).toMatchObject(statesData);
    expect(entityInstance.stateMachine).toMatchObject(stateMachine);
  });
});
