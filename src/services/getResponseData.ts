import type { ResponseDefinition } from "../interfaces/graphql";
import type { StateController } from "../interfaces/state";
import { getEntityInstance } from "../utils/state/stateMachine";

export const getResponseData = (
  response: ResponseDefinition | Array<ResponseDefinition>,
  stateControllers: Array<StateController>,
  entities
) => {
  const isArrayResponse = Array.isArray(response);
  if (isArrayResponse) {
    return response.map((responseItem) => {
      refreshInstanceState(responseItem, stateControllers, entities);
      return getEntityStateData(responseItem, stateControllers);
    });
  } else {
    refreshInstanceState(response, stateControllers, entities);
    return getEntityStateData(response, stateControllers);
  }
};

const getEntityStateData = (
  { id, entity, state = "" }: ResponseDefinition,
  stateControllers: Array<StateController>
) => {
  const entityInstance = getEntityInstance(stateControllers, entity, id);

  const response = state
    ? entityInstance.getStateData(state)
    : entityInstance.getCurrentStateData();

  const isEmptyResponse = !Boolean(response && Object.keys(response).length);

  return isEmptyResponse ? null : response;
};

export const refreshInstanceState = (
  { id, entity }: ResponseDefinition,
  stateControllers: Array<StateController>,
  entities
) => {
  const entityInstance = getEntityInstance(stateControllers, entity, id);

  const { statesData } = entities[entity].instances[id];
  const { stateMachine } = entities[entity];

  entityInstance.refreshState(statesData, stateMachine);
};
