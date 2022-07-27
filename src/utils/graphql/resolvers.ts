import { getConfig, getSupportedRequests } from '.';
import { RequestSpecifications } from '../../interfaces/graphql';
import { executeRequest } from '../../services/request';
import { getControllers } from '../state/stateController';

export const buildResolvers = (
  configFilePath: string,
  schemaFilePath: string
) => {
  const supportedRequests: Array<RequestSpecifications> =
    getSupportedRequests(schemaFilePath);
  const { entities } = getConfig(configFilePath);

  const controllers = getControllers(entities);

  return supportedRequests.reduce(
    (resolvers, request) => {
      const { name, type } = request;

      return {
        ...resolvers,
        [type]: {
          ...resolvers[type],
          [name]() {
            return executeRequest(name, controllers, configFilePath);
          },
        },
      };
    },
    { Query: {}, Mutation: {} }
  );
};
