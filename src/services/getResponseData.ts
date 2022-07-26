import { ResponseDefinition } from '../interfaces/graphql';
import { StateController } from '../interfaces/state';
import { getEntityInstance } from '../utils/state/stateMachine';

//todo: I need to modify the config.json structure; each entity instance should have it's own state machine,
export const getResponseData = (
  response: ResponseDefinition | Array<ResponseDefinition>,
  stateControllers: Array<StateController>
) => {
  if (Array.isArray(response)) {
    return response.map((responseChunk) => {
      return getEntityStateData(responseChunk, stateControllers);
    });
  } else {
    return getEntityStateData(response, stateControllers);
  }
};

const getEntityStateData = (
  response: ResponseDefinition,
  stateControllers: Array<StateController>
) => {
  const { id, entity } = response;
  const entityInstance = getEntityInstance(stateControllers, entity, id);

  let responseData;

  if (response.state) {
    responseData = entityInstance.getStateData(response.state);
  } else {
    responseData = entityInstance.getCurrentStateData();
  }

  if (!Object.keys(responseData).length) {
    responseData = null;
  }

  return responseData;
};
