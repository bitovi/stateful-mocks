import { getSupportedRequests } from '.';
import { RequestSpecifications } from '../../interfaces/graphql';
import { executeMutation, executeQuery } from '../../services/request';

export const buildResolvers = () => {
  const supportedRequests: Array<RequestSpecifications> =
    getSupportedRequests();

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
