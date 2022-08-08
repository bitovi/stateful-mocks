import fs from 'fs';
import { parse } from 'graphql';
import { hri } from 'human-readable-ids';

import { ServerError } from '../errors/serverError';
import { getMocks } from '../generator';
import {
  Config,
  ConfigRequest,
  Entity,
  ResponseDefinition,
} from '../interfaces/graphql';
import { getConfig, getFile } from './graphql';
const fsPromises = fs.promises;

//todo: find type for schema
export const getEntityName = (
  requestName: string,
  requestType: string,
  schema: any
) => {
  const schemaParsed: any = parse(String(schema));

  const typeDefinitions = schemaParsed.definitions.find(
    (definition) => definition.name.value.toLowerCase() === requestType
  );

  const { type } = typeDefinitions.fields.find(
    (field) => field.name.value === requestName
  );

  if (type.kind === 'ListType') {
    return type.type.name.value;
  } else {
    return type.name.value;
  }
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
  schema: any
) => {
  const schemaParsed: any = parse(String(schema));

  const typeDefinitions = schemaParsed.definitions.find(
    (definition) => definition.name.value.toLowerCase() === requestType
  );

  const { type } = typeDefinitions.fields.find(
    (field) => field.name.value === requestName
  );

  if (type.kind === 'ListType') {
    return true;
  } else {
    return false;
  }
};

export const getNewEntity = async (
  query,
  schema,
  variables
): Promise<Entity> => {
  const mock = await getMocks({
    query,
    schema,
    variables,
  });

  const instanceId = hri.random();
  const stateName = hri.random().split('-')[0];
  const eventName = `make${stateName
    .slice(0, 1)
    .toUpperCase()}${stateName.slice(1)}`;

  return {
    stateMachine: {
      initial: stateName,
      states: {
        empty: {},
        [stateName]: {
          on: {
            [eventName]: stateName,
          },
        },
      },
    },
    instances: {
      [instanceId]: {
        statesData: {
          [stateName]: mock,
        },
      },
    },
  };
};

const formatNewRequest = (
  requestBody: any,
  entity: string,
  isList: boolean,
  requestType: any,
  entities: { [key: string]: Entity }
): ConfigRequest => {
  const [id] = Object.keys(entities[entity]?.instances ?? {});

  const { states } = entities[entity].stateMachine;
  const lastAddedKey = Number([Object.keys(states).length - 1]);

  const stateName = Object.keys(states)[lastAddedKey];

  const [event] = Object.keys(states[stateName].on);

  const body = JSON.stringify(requestBody);
  const response: ResponseDefinition = {
    entity,
    id,
  };

  let newRequest: ConfigRequest = {
    body,
    response: isList ? [response] : response,
  };

  if (requestType === 'mutation') {
    response.state = stateName;

    newRequest.stateChanges = [
      {
        entity,
        id,
        event,
      },
    ];
  }

  return newRequest;
};

export const saveNewRequestInConfig = async (
  { body: requestBody }: any,
  requestName: string,
  requestType: string,
  configFilePath: string,
  schemaFilePath: string
) => {
  const schema = getFile(schemaFilePath);
  const config = getConfig(configFilePath);
  let { entities, requests } = config;
  const { query, variables } = requestBody;

  const entity = getEntityName(requestName, requestType, schema);

  const isNewEntity = !Boolean(
    Object.keys(entities[entity]?.instances ?? {}).length
  );

  if (isNewEntity) {
    const newEntity = await getNewEntity(query, schema, variables);

    entities = { ...entities, [entity]: newEntity };
  } else {
    const mock = await getMocks({
      query,
      schema,
      variables,
    });

    const id = Object.keys(entities[entity].instances)[0];
    const stateName = hri.random().split('-')[0];
    const eventName = `make${stateName
      .slice(0, 1)
      .toUpperCase()}${stateName.slice(1)}`;

    entities[entity].stateMachine.states[stateName] = {
      on: { [eventName]: stateName },
    };

    entities[entity].instances[id].statesData[stateName] = mock;
  }

  const isList = isQueryList(requestName, requestType, getFile(schemaFilePath));

  const newRequest = formatNewRequest(
    requestBody,
    entity,
    isList,
    requestType,
    entities
  );
  requests.push(newRequest);

  await writeNewConfig({ entities, requests }, configFilePath);
};

export const writeNewConfig = async (
  config: Config,
  configFilePath: string
): Promise<void> => {
  try {
    await fsPromises.writeFile(configFilePath, JSON.stringify(config, null, 3));
  } catch (error: unknown) {
    throw new ServerError();
  }
};
export const ensureConfigFileExists = async (
  configFilePath: string
): Promise<void> => {
  const absolutePath = `${process.cwd()}/${configFilePath}`;
  const isValidPath = fs.existsSync(absolutePath);

  if (!isValidPath) {
    ensureFileDirectoryExits(configFilePath);
    const config = {
      entities: {},
      requests: [],
    };
    await writeNewConfig(config, configFilePath);
  }
};

const ensureFileDirectoryExits = (filePath: string) => {
  if (filePath.includes('/')) {
    const directoriesPath = filePath.substr(0, filePath.lastIndexOf('/'));

    fs.mkdirSync(directoriesPath, { recursive: true });
  }
};
