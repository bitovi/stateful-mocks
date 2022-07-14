import { ServerError } from "../errors/serverError";
import { ConfigRequest } from "../interfaces/graphql";
import { getConfig } from "../utils/graphql";
import { getRequestName } from "../utils/graphql/request";
import { getControllers } from "../utils/state/stateController";
import { getEntityInstance } from "../utils/state/stateMachine";
import { getResponseData } from "./getResponseData";

const getRequestFromConfig = (operationName: string) => {
  const { requests } = getConfig();

  return requests.find((request) => getRequestName(request) === operationName);
};

export const getConfigRequestsNames = (requests: Array<ConfigRequest>) => {
  return requests.reduce((resolvers, request) => {
    const queryName = getRequestName(request);

    return [...resolvers, queryName];
  }, []);
};

export const executeQuery = (operationName: string) => {
  const request = getRequestFromConfig(operationName);
  const { entities } = getConfig();
  const stateController = getControllers(entities);

  if (!request) {
    throw new ServerError(
      `Couldn't find request ${operationName} in config.json`
    );
  }

  return getResponseData(request.response, stateController);
};

export const executeMutation = (operationName: string) => {
  const request = getRequestFromConfig(operationName);
  const { entities } = getConfig();
  const stateController = getControllers(entities);

  if (!request) {
    throw new ServerError(
      `Couldn't find request ${operationName} in config.json`
    );
  }

  const { response, stateChanges } = request;

  if (stateChanges) {
    stateChanges.forEach(({ id, event, entity }) => {
      getEntityInstance(stateController, entity, id).send(event);
    });
  }
  return getResponseData(response, stateController);
};
