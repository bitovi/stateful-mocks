import { getConfig, getSupportedRequests } from '.';
import { RequestSpecifications } from '../../interfaces/graphql';
import { StateController } from '../../interfaces/state';
import { executeRequest } from '../../services/request';
import { getControllers } from '../state/stateController';

export const buildResolvers = (
  configFilePath: string,
  schemaFilePath: string
) => {
  const { entities } = getConfig(configFilePath);
  const controllers: Array<StateController> = getControllers(entities);
  const supportedRequests: Array<RequestSpecifications> =
    getSupportedRequests(schemaFilePath);

  return supportedRequests.reduce(
    (resolvers, request) => {
      const { name, type } = request;

      return {
        ...resolvers,
        [type]: {
          ...resolvers[type],
          [name]() {
            return executeRequest(name, configFilePath, controllers);
          },
        },
      };
    },
    { Query: {}, Mutation: {} }
  );
};
