import { ConfigRequest } from '../../interfaces/graphql';
import { StateController } from '../../interfaces/state';
import { executeMutation, executeQuery } from '../../services/request';
import { getRequestName, getRequestType } from './request';

export const buildResolvers = (
  requests: Array<ConfigRequest>,
  stateControllers: Array<StateController>
) => {
  return requests.reduce(
    (resolvers, request) => {
      const operationName = getRequestName(request);
      const operationType = getRequestType(request);

      switch (operationType) {
        case 'query':
          return {
            ...resolvers,
            Query: {
              ...resolvers.Query,
              [operationName]() {
                return executeQuery(operationName, stateControllers);
              },
            },
          };
        case 'mutation':
          return {
            ...resolvers,
            Mutation: {
              ...resolvers.Mutation,
              [operationName]() {
                return executeMutation(operationName, stateControllers);
              },
            },
          };
      }

      return resolvers;
    },
    { Query: {}, Mutation: {} }
  );
};
