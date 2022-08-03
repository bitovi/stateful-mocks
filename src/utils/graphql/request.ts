import { parse } from "graphql";
import { ConfigRequest } from "../../interfaces/graphql";
import { deepEqual } from "../object";

//todo: check in next standup: I think the return type from parse set by graphql may be mistaken; it's probably OperationDefinitionNode in some cases
const getParsedQuery = (request: ConfigRequest): any => {
  return parse(JSON.parse(String(request.body)).query);
};

export const getRequestName = (request): string => {
  return getParsedQuery(request).definitions[0].selectionSet.selections[0].name
    .value;
};

export const getRequestType = (request): string => {
  return getParsedQuery(request).definitions[0].operation;
};

export const isNewRequest = (requests: Array<any>, request: any): boolean => {
  const { query, variables } = request.body;
  return !!!requests.find(({ body }) => {
    const { query: previousRequestQuery, variables: previousRequestVariables } =
      JSON.parse(body);

    return (
      String(query) === previousRequestQuery &&
      deepEqual(variables, previousRequestVariables)
    );
  });
};
