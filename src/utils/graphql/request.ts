import type {
  ConfigRequest,
  Entities,
  Variables,
} from "../../interfaces/graphql";
import type { StateController } from "../../interfaces/state";
import { GraphQLSchema, parse } from "graphql";
import { getConfig, getSchemaFile } from ".";
import { getMocks } from "../../generator";
import { getEntityName } from "../config";
import { deepEqual, mergeDeep } from "../object";
import { getControllers } from "../state/stateController";
import { getEntityInstance } from "../state/stateMachine";
import { writeFile } from "../io";

interface ConfigArguments {
  query: string;
  schema: GraphQLSchema;
  variables: Variables;
  controllers: Array<StateController>;
  entities: Entities;
  entity: string;
  id?: string;
  stateName?: string;
}

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

export const ensureStateHasAllRequestFields = async (
  request,
  configFilePath: string,
  schemaFilePath: string,
  matchingRequestFromConfig: ConfigRequest,
  requestName: string,
  requestType: string
): Promise<void> => {
  const schema = await getSchemaFile(schemaFilePath);
  const { requests, entities } = await getConfig(configFilePath);
  const { query, variables } = request.body;

  const { response } = matchingRequestFromConfig;

  const entity = getEntityName(requestName, requestType, schema);
  const controllers: Array<StateController> = getControllers(entities);

  const options = { query, schema, variables, controllers, entities, entity };

  if (requestType === "query") {
    if (Array.isArray(response)) {
      await Promise.all(
        response.map(async ({ id }) => await formatArguments(options, id))
      );
    } else {
      await formatArguments(options, response.id);
    }
  } else {
    if (Array.isArray(response)) {
      await Promise.all(
        response.map(
          async ({ id, state }) => await formatArguments(options, id, state)
        )
      );
    } else {
      const { state, id } = response;
      await formatArguments(options, id, state);
    }
  }

  await writeFile(
    configFilePath,
    JSON.stringify({ entities, requests }, null, "\t")
  );
};

const formatArguments = async (
  config: ConfigArguments,
  id: string,
  stateName?: string
) => {
  await mockMissingInstanceFields({ ...config, id, stateName });
};

async function mockMissingInstanceFields(config: ConfigArguments) {
  const {
    query,
    schema,
    variables,
    controllers,
    entities,
    entity,
    id,
    stateName,
  } = config;

  let mock = await getMocks({ query, schema, variables });

  if (Array.isArray(mock)) {
    mock = mock[0];
  }
  const currentState = getEntityInstance(
    controllers,
    entity,
    id
  ).getCurrentState();

  if (currentState === "empty") return;

  const state = stateName ?? currentState;
  const stateData = entities[entity].instances[id as string].statesData[state];
  const mergedState = mergeDeep(mock, stateData);

  entities[entity].instances[id as string].statesData[state] = mergedState;
}

export const getTypeDefinitionForRequest = (
  requestName: string,
  requestType: string,
  schema: GraphQLSchema
) => {
  const schemaParsed: any = parse(String(schema));
  const typeDefinitions = schemaParsed.definitions.find(
    (definition) => definition.name.value.toLowerCase() === requestType
  );
  const { type } = typeDefinitions.fields.find(
    (field) => field.name.value === requestName
  );

  return type;
};

export const getRequestFields = ({ body }: ConfigRequest) => {
  //todo: find type for definition
  const definition: any = parse(String(body.query)).definitions[0];

  return definition.selectionSet.selections[0].selectionSet.selections.map(
    (field) => field.name.value
  );
};

export const isQueryList = (
  requestName: string,
  requestType: string,
  schema: GraphQLSchema
) => {
  const type = getTypeDefinitionForRequest(requestName, requestType, schema);

  if (type.kind === "ListType") {
    return true;
  } else {
    return false;
  }
};
