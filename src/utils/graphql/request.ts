import { parse } from "graphql";
import { getConfig, getSchemaFile } from ".";
import { getMocks } from "../../generator";
import { ConfigRequest } from "../../interfaces/graphql";
import { StateController } from "../../interfaces/state";
import { getEntityName, writeNewConfig } from "../config";
import { deepEqual, mergeDeep } from "../object";
import { getControllers } from "../state/stateController";
import { getEntityInstance } from "../state/stateMachine";
import signale from "signale";

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

export const findRequest = (
  requests: Array<any>,
  request: any
): ConfigRequest => {
  const { query, variables } = request.body;
  return requests.find((previousRequest) => {
    const { variables: previousRequestVariables } = JSON.parse(
      previousRequest.body
    );

    const definitions: any = parse(query).definitions.find(
      (definition) => definition.kind === "OperationDefinition"
    );
    const queryName = definitions.selectionSet.selections[0].name.value;

    const previousRequestQueryName = getRequestName(previousRequest);

    return (
      String(queryName) === previousRequestQueryName &&
      deepEqual(variables, previousRequestVariables)
    );
  });
};

const getRequestFields = ({ body }: ConfigRequest) => {
  const definition: any = parse(String(body.query)).definitions[0];

  return definition.selectionSet.selections[0].selectionSet.selections.map(
    (field) => field.name.value
  );
};

export const ensureStateHasAllRequestFields = async (
  request,
  configFilePath: string,
  schemaFilePath: string,
  matchingRequestFromConfig: ConfigRequest,
  requestName: string,
  requestType: string
): Promise<void> => {
  signale.pending("ensureStateHasAllRequestFields");
  const schema = getSchemaFile(schemaFilePath);
  const { requests, entities } = getConfig(configFilePath);
  const { query, variables } = request.body;

  const { response } = matchingRequestFromConfig;

  const entity = getEntityName(requestName, requestType, schema);
  const controllers: Array<StateController> = getControllers(entities);

  if (requestType === "query") {
    if (Array.isArray(response)) {
      await Promise.all(
        response.map(async ({ id }) => {
          await mockMissingInstanceFields(
            query,
            schema,
            variables,
            controllers,
            entities,
            entity,
            id
          );
        })
      );
    } else {
      await mockMissingInstanceFields(
        query,
        schema,
        variables,
        controllers,
        entities,
        entity,
        response.id
      );
    }
  } else {
    if (Array.isArray(response)) {
      await Promise.all(
        response.map(async ({ id, state }) => {
          await mockMissingInstanceFields(
            query,
            schema,
            variables,
            controllers,
            entities,
            entity,
            id,
            state
          );
        })
      );
    } else {
      const { state, id } = response;
      await mockMissingInstanceFields(
        query,
        schema,
        variables,
        controllers,
        entities,
        entity,
        id,
        state
      );
    }
  }

  await writeNewConfig({ entities, requests }, configFilePath);
  signale.success("ensureStateHasAllRequestFields");
};

const mockMissingInstanceFields = async (
  query,
  schema,
  variables,
  controllers,
  entities,
  entity,
  id,
  returnState?
) => {
  const mock = await getMocks({
    query,
    schema,
    variables,
  });

  const currentState = getEntityInstance(
    controllers,
    entity,
    id
  ).getCurrentState();

  if (currentState === "empty") return;

  const state = returnState ?? currentState;

  const stateData = entities[entity].instances[id].statesData[state];

  const mergedState = mergeDeep(mock, stateData);

  entities[entity].instances[id].statesData[state] = mergedState;
};
