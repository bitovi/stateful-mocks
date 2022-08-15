import { parse } from "graphql";
import { hri } from "human-readable-ids";
import { createDirectory, existsDirectory, writeFile } from "./io";
import { ServerError } from "../errors/serverError";
import { getMocks } from "../generator";
import {
  Config,
  ConfigRequest,
  Entity,
  ResponseDefinition,
} from "../interfaces/graphql";
import { getConfig, getSchemaFile } from "./graphql";

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

  if (type.kind === "ListType") {
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

  if (type.kind === "ListType") {
    return true;
  } else {
    return false;
  }
};

const generateEventProperties = () => {
  const stateName = hri.random().split("-")[0];
  const eventName = `make${stateName
    .slice(0, 1)
    .toUpperCase()}${stateName.slice(1)}`;

  return { stateName, eventName };
};

export const getNewEntity = async (
  query,
  schema,
  variables,
  isList: boolean
): Promise<Entity> => {
  const mock = await getMocks({
    query,
    schema,
    variables,
  });

  if (isList) {
    const firstInstanceId = hri.random();
    const secondInstanceId = hri.random();

    const { stateName, eventName } = generateEventProperties();
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
        [firstInstanceId]: {
          statesData: {
            [stateName]: mock?.length ? mock[0] : {},
          },
        },
        [secondInstanceId]: {
          statesData: {
            [stateName]: mock?.length ? mock[1] : {},
          },
        },
      },
    };
  } else {
    const id = hri.random();
    const { stateName, eventName } = generateEventProperties();
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
        [id]: {
          statesData: {
            [stateName]: mock,
          },
        },
      },
    };
  }
};

const formatNewRequest = (
  requestBody: any,
  entity: string,
  isList: boolean,
  requestType: any,
  entities: { [key: string]: Entity }
): ConfigRequest => {
  const instancesIds = Object.keys(entities[entity]?.instances ?? {});

  const { states } = entities[entity].stateMachine;
  const lastAddedKey = Number([Object.keys(states).length - 1]);

  const stateName = Object.keys(states)[lastAddedKey];

  const [event] = Object.keys(states[stateName].on);

  const body = JSON.stringify(requestBody);
  const response: ResponseDefinition | Array<ResponseDefinition> = isList
    ? [
        {
          entity,
          id: instancesIds[0],
        },
        {
          entity,
          id: instancesIds[1],
        },
      ]
    : {
        entity,
        id: instancesIds[0],
      };

  let newRequest: ConfigRequest = {
    body,
    response,
  };

  if (requestType === "mutation") {
    if (Array.isArray(response)) {
      response.map((responsePart) => {
        responsePart.state = stateName;

        newRequest.stateChanges = [
          {
            entity,
            id: instancesIds[0],
            event,
          },
          {
            entity,
            id: instancesIds[1],
            event,
          },
        ];
      });
    } else {
      response.state = stateName;

      newRequest.stateChanges = [
        {
          entity,
          id: instancesIds[0],
          event,
        },
      ];
    }
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
  const schema = getSchemaFile(schemaFilePath);
  const config = getConfig(configFilePath);
  let { entities, requests } = config;
  const { query, variables } = requestBody;
  const isList = isQueryList(
    requestName,
    requestType,
    getSchemaFile(schemaFilePath)
  );

  const entity = getEntityName(requestName, requestType, schema);

  const isNewEntity = !Boolean(
    Object.keys(entities[entity]?.instances ?? {}).length
  );

  if (isNewEntity) {
    const newEntity = await getNewEntity(query, schema, variables, isList);

    entities = { ...entities, [entity]: newEntity };
  } else {
    const mock = await getMocks({
      query,
      schema,
      variables,
    });

    if (isList) {
      const { stateName, eventName } = generateEventProperties();
      const { initial } = entities[entity].stateMachine;

      //todo: refactor this into util func that doesn't relay on array position
      const instancesOfEntity = Object.keys(entities[entity].instances);
      const firstInstanceId = instancesOfEntity[0];
      const secondInstanceId =
        instancesOfEntity.length < 2 ? hri.random() : instancesOfEntity[1];

      if (instancesOfEntity.length < 2) {
        entities[entity].instances = {
          ...entities[entity].instances,
          [secondInstanceId]: {
            statesData: {
              [initial]: {},
            },
          },
        };
      }

      entities[entity].stateMachine.states[stateName] = {
        on: { [eventName]: stateName },
      };
      entities[entity].instances[firstInstanceId].statesData[stateName] =
        mock?.length ? mock[0] : {};
      entities[entity].instances[secondInstanceId].statesData[initial] =
        mock?.length ? mock[1] : {};
    } else {
      const id = Object.keys(entities[entity].instances)[0];

      const { stateName, eventName } = generateEventProperties();

      entities[entity].stateMachine.states[stateName] = {
        on: { [eventName]: stateName },
      };

      entities[entity].instances[id].statesData[stateName] = mock;
    }
  }

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
    await writeFile(configFilePath, JSON.stringify(config, null, 3));
  } catch (error: unknown) {
    throw new ServerError();
  }
};
export const ensureConfigFileExists = async (
  configFilePath: string
): Promise<void> => {
  const absolutePath = `${process.cwd()}/${configFilePath}`;
  const isValidPath = existsDirectory(absolutePath);

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
  if (filePath.includes("/")) {
    const directoriesPath = filePath.substr(0, filePath.lastIndexOf("/"));
    createDirectory(directoriesPath);
  }
};
