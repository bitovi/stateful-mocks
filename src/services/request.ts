import type { Config } from "./../interfaces/graphql";
import type { StateController } from "../interfaces/state";
import type { ConfigRequest, Variables } from "../interfaces/graphql";
import { validate } from "../utils/config/validation";
import { ServerError } from "../errors/serverError";
import { getConfig } from "../utils/graphql";
import { getRequestName } from "../utils/graphql/request";
import { deepEqual } from "../utils/object";
import { getControllers } from "../utils/state/stateController";
import { getEntityInstance } from "../utils/state/stateMachine";
import { getResponseData, refreshInstanceState } from "./getResponseData";

const getRequestFromConfig = (
  operationName: string,
  variables: Variables,
  config: Config
) => {
  return config.requests.find((request) => {
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
  config: Config
) => {
  const { entities } = config;
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

export const executeRequest = async (
  operationName: string,
  variables: Variables,
  configFilePath: string,
  controllers: Array<StateController>
) => {
  const config = await getConfig(configFilePath);
  const { entities, requests } = config;
  const request = getRequestFromConfig(operationName, variables, config);
  const updatedControllers = ensureControllersAreUpdated(controllers, config);

  const isConfigFileValid = validate(config);
  if (!isConfigFileValid) {
    return {};
  }

  if (!request) {
    throw new ServerError(
      `Couldn't find request ${operationName} in config.json`
    );
  }

  const { response, stateChanges = null } = request;
  if (stateChanges) {
    stateChanges.forEach(({ id, event, entity }) => {
      const entityInstance = getEntityInstance(updatedControllers, entity, id);

      refreshInstanceState({ id, entity }, updatedControllers, entities);
      entityInstance.send(event);
    });
  }

  return getResponseData(response, updatedControllers, entities);
};
