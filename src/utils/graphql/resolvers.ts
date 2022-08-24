import type { RequestSpecifications } from "../../interfaces/graphql";
import type { StateController } from "../../interfaces/state";
import { getConfig, getSupportedRequests } from ".";
import { executeRequest } from "../../services/request";
import { getControllers } from "../state/stateController";

export const buildResolvers = async (
  configFilePath: string,
  schemaFilePath: string
) => {
  const { entities } = await getConfig(configFilePath);
  const controllers: StateController[] = getControllers(entities);
  const supportedRequests: RequestSpecifications[] = await getSupportedRequests(
    schemaFilePath
  );

  return supportedRequests.reduce(
    (resolvers, request) => {
      const { name, type } = request;

      return {
        ...resolvers,
        [type]: {
          ...resolvers[type],
          [name](_parent, _args, _context, info) {
            return executeRequest(
              name,
              info.variableValues,
              configFilePath,
              controllers
            );
          },
        },
      };
    },
    { Query: {}, Mutation: {} }
  );
};
