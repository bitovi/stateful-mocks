import { ServerError } from "../errors/serverError";
import { ConfigRequest } from "../interfaces/graphql";
import { StateController } from "../interfaces/state";
import { getConfig } from "../utils/graphql";
import { getRequestName } from "../utils/graphql/request";
import { getEntityInstance } from "../utils/state/stateMachine";
import { getResponseData } from "./getResponseData";

const getRequestFromConfig = (
  operationName: string,
  configFilePath: string
) => {
  const { requests } = getConfig(configFilePath);

  return requests.find((request) => getRequestName(request) === operationName);
};

export const getConfigRequestsNames = (requests: Array<ConfigRequest>) => {
  return requests.reduce((resolvers, request) => {
    const queryName = getRequestName(request);

    return [...resolvers, queryName];
  }, []);
};

export const executeRequest = (
  operationName: string,
  stateControllers: Array<StateController>,
  configFilePath: string
) => {
  const request = getRequestFromConfig(operationName, configFilePath);

  if (!request) {
    throw new ServerError(
      `Couldn't find request ${operationName} in config.json`
    );
  }

  const { response, stateChanges = null } = request;
  if (stateChanges) {
    stateChanges.forEach(({ id, event, entity }) => {
      const entityInstance = getEntityInstance(stateControllers, entity, id);

      entityInstance.send(event);
    });
  }
  return getResponseData(response, stateControllers);
};
