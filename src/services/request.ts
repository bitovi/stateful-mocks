import { ServerError } from '../errors/serverError';
import { StateController } from '../interfaces/state';
import { getConfig } from '../utils/graphql';
import { getRequestName } from '../utils/graphql/request';
import { getEntityInstance } from '../utils/state/stateMachine';
import { getResponseData } from './getResponseData';

export const executeQuery = (
  operationName: string,
  stateController: Array<StateController>
) => {
  const { requests } = getConfig();

  const request = requests.find(
    (request) => getRequestName(request) === operationName
  );

  if (!request) {
    throw new ServerError(
      `Couldn't find request ${operationName} in config.json`
    );
  }

  return getResponseData(request.response, stateController);
};

export const executeMutation = (
  operationName: string,
  stateController: Array<StateController>
) => {
  const { requests } = getConfig();

  const request = requests.find(
    (request) => getRequestName(request) === operationName
  );

  if (!request) {
    throw new ServerError(
      `Couldn't find request ${operationName} in config.json`
    );
  }

  const { response, stateChanges } = request;

  stateChanges.forEach(({ id, event, entity }) => {
    getEntityInstance(stateController, entity, id).send(event);
  });

  return getResponseData(response, stateController);
};
