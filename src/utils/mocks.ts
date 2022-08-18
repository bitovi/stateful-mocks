import { hri } from "human-readable-ids";

export const mockStateMachine = (stateName: string, eventName: string) => {
  return {
    initial: stateName,
    states: {
      empty: {},
      [stateName]: {
        on: {
          [eventName]: stateName,
        },
      },
    },
  };
};

export const generateEventProperties = () => {
  const stateName = hri.random().split("-")[0];
  const eventName = `make${stateName
    .slice(0, 1)
    .toUpperCase()}${stateName.slice(1)}`;

  return { stateName, eventName };
};
