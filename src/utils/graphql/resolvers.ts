import { getSupportedRequests } from ".";
import { RequestSpecifications } from "../../interfaces/graphql";
import { executeMutation, executeQuery } from "../../services/request";

export const buildResolvers = (configFilePath:string, schemaFilePath: string) => {
  const supportedRequests: Array<RequestSpecifications> =
    getSupportedRequests(schemaFilePath);

  return supportedRequests.reduce(
    (resolvers, request) => {
      const { name, type } = request;

      switch (type) {
        case "Query":
          return {
            ...resolvers,
            Query: {
              ...resolvers.Query,
              [name]() {
                return executeQuery(name, configFilePath);
              },
            },
          };
        case "Mutation":
          return {
            ...resolvers,
            Mutation: {
              ...resolvers.Mutation,
              [name]() {
                return executeMutation(name, configFilePath);
              },
            },
          };
      }

      return resolvers;
    },
    { Query: {}, Mutation: {} }
  );
};
