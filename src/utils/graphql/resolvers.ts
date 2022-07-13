import { getSupportedRequests } from '.';
import { executeMutation, executeQuery } from '../../services/request';

interface RequestDefinition {
  name: string;
  type: string;
}
export const buildResolvers = () => {
  const supportedRequests: Array<RequestDefinition> = getSupportedRequests();

  return supportedRequests.reduce(
    (resolvers, request) => {
      const { name, type } = request;

      switch (type) {
        case 'Query':
          return {
            ...resolvers,
            Query: {
              ...resolvers.Query,
              [name]() {
                return executeQuery(name);
              },
            },
          };
        case 'Mutation':
          return {
            ...resolvers,
            Mutation: {
              ...resolvers.Mutation,
              [name]() {
                return executeMutation(name);
              },
            },
          };
      }

      return resolvers;
    },
    { Query: {}, Mutation: {} }
  );
};
