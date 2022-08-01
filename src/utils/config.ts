import fs from "fs";
import { parse } from "graphql";
import { hri } from "human-readable-ids";

import { ServerError } from "../errors/serverError";
import { getMocks } from "../generator";
import {
  Config,
  ConfigRequest,
  Entity,
  ResponseDefinition,
} from "../interfaces/graphql";
import { getConfig, getFile } from "./graphql";
const fsPromises = fs.promises;

//todo: find type for schema
const getEntityName = (
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

  if (type.kind === "ListType") {
    return type.type.name.value;
  } else {
    return type.name.value;
  }
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

  if (type.kind === "ListType") {
    return true;
  } else {
    return false;
  }
};

const getNewEntity = async (query: any, schema: any): Promise<Entity> => {
  const mock = await getMocks({
    query,
    schema,
  });

  const instanceId = hri.random();
  const stateName = hri.random().split("-")[0];
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

const writeNewRequest = (
  requestBody: any,
  entity: string,
  isList: boolean,
  requestType: any,
  entities: { [key: string]: Entity }
): ConfigRequest => {
  const [id] = Object.keys(entities[entity]?.instances ?? {});
  //todo: find state transition instead of hard coded second position
  const stateName = Object.keys(entities[entity].stateMachine.states)[1];
  const [event] = Object.keys(
    entities[entity].stateMachine.states[stateName].on
  );

  const body = JSON.stringify(requestBody);
  const response: ResponseDefinition = {
    entity,
    id,
  };

  let newRequest: ConfigRequest = {
    body,
    response: isList ? [response] : response,
  };

  if (requestType === "mutation") {
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

  const entity = getEntityName(requestName, requestType, schema);

  const isNewEntity = !Boolean(
    Object.keys(entities[entity]?.instances ?? {}).length
  );

  if (isNewEntity) {
    const newEntity = await getNewEntity(requestBody.query, schema);
    entities = { ...entities, [entity]: newEntity };
  }

  const isList = isQueryList(requestName, requestType, getFile(schemaFilePath));

  const newRequest = writeNewRequest(
    requestBody,
    entity,
    isList,
    requestType,
    entities
  );
  requests.push(newRequest);

  await writeNewConfig({ entities, requests }, configFilePath);
};

const writeNewConfig = async (
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
  const validPath = fs.existsSync(absolutePath);

  if (!validPath) {
    ensureFileDirectoryExits(configFilePath);
    const config = {
      entities: {},
      requests: [],
    };
    await writeNewConfig(config, configFilePath);
  }
};

const ensureFileDirectoryExits = (filePath: string) => {
  if (filePath.includes("/")) {
    const directoriesPath = filePath.substr(0, filePath.lastIndexOf("/"));

    fs.mkdirSync(directoriesPath, { recursive: true });
  }
};
