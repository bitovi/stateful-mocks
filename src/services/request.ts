import { ServerError } from "../errors/serverError";
import { ConfigRequest } from "../interfaces/graphql";
import { StateController } from "../interfaces/state";
import { getConfig } from "../utils/graphql";
import { getRequestName } from "../utils/graphql/request";
import { deepEqual } from "../utils/object";
import { getControllers } from "../utils/state/stateController";
import { getEntityInstance } from "../utils/state/stateMachine";
import { getResponseData } from "./getResponseData";

interface Variables {
  input: { [key: string]: any };
}

const getRequestFromConfig = (
  operationName: string,
  variables: Variables,
  configFilePath: string
): ConfigRequest | undefined => {
  const { requests } = getConfig(configFilePath);

  return requests.find((request) => {
    const { variables: previousRequestVariables } = JSON.parse(request.body);

    return (
      getRequestName(request) === operationName &&
      deepEqual(variables, previousRequestVariables)
    );
  });
};

export const getConfigRequestsNames = (requests: Array<ConfigRequest>) => {
  return requests.reduce((resolvers, request) => {
    const queryName = getRequestName(request);

    return [...resolvers, queryName];
  }, []);
};

const ensureControllersAreUpdated = (
  oldControllers: Array<StateController>,
  configFilePath: string
) => {
  const { entities } = getConfig(configFilePath);
  const newControllers: Array<StateController> = getControllers(entities);

  if (oldControllers !== newControllers) {
    newControllers.forEach((controller) => {
      if (
        !oldControllers.some((element) => element.entity === controller.entity)
      )
        oldControllers.push(controller);
    });
  }

  return oldControllers;
};

export const executeRequest = (
  operationName: string,
  variables: Variables,
  configFilePath: string,
  controllers: Array<StateController>
) => {
  const request = getRequestFromConfig(
    operationName,
    variables,
    configFilePath
  );

  const updatedControllers = ensureControllersAreUpdated(
    controllers,
    configFilePath
  );
  const { entities } = getConfig(configFilePath);

  if (!request) {
    throw new ServerError(
      `Couldn't find request ${operationName} in config.json`
    );
  }

  const { response, stateChanges = null } = request;
  if (stateChanges) {
    stateChanges.forEach(({ id, event, entity }) => {
      const entityInstance = getEntityInstance(updatedControllers, entity, id);
      const { statesData } = entities[entity].instances[id];
      const { stateMachine } = entities[entity];
      entityInstance.refreshState(statesData, stateMachine);
      entityInstance.send(event);
    });
  }

  return getResponseData(response, updatedControllers, entities);
};
