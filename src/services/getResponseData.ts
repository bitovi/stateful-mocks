import { ResponseDefinition } from "../interfaces/graphql";
import { StateController } from "../interfaces/state";
import { getEntityInstance } from "../utils/state/stateMachine";

export const getResponseData = (
  response: ResponseDefinition | Array<ResponseDefinition>,
  stateControllers: Array<StateController>
) => {
  const isComposedReponse = Array.isArray(response);
  if (isComposedReponse) {
    return response.map((responseChunk) => {
      return getEntityStateData(responseChunk, stateControllers);
    });
  } else {
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

  const isEmptyResponse = !Boolean(Object.keys(response).length);

  return isEmptyResponse ? null : response;
};
