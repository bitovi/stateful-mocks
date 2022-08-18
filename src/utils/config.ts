import { hri } from "human-readable-ids";
import { GraphQLSchema } from "graphql";
import { createDirectory, existsDirectory, writeFile } from "./io";
import { ServerError } from "../errors/serverError";
import { getMocks } from "../generator";
import {
  Config,
  ConfigRequest,
  Entities,
  Entity,
  ResponseDefinition,
} from "../interfaces/graphql";
import { getConfig, getSchemaFile } from "./graphql";
import { getTypeDefinitionForRequest, isQueryList } from "./graphql/request";
import { generateEventProperties, mockStateMachine } from "./mocks";

interface NewRequestConfiguration {
  entity: string;
  isList: boolean;
  requestType: any;
  entities: Entities;
}

export const getEntityName = (
  requestName: string,
  requestType: string,
  schema: GraphQLSchema
) => {
  const type = getTypeDefinitionForRequest(requestName, requestType, schema);

  if (type.kind === "ListType") {
    return type.type.name.value;
  } else {
    return type.name.value;
  }
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

  const { stateName, eventName } = generateEventProperties();
  const stateMachine = mockStateMachine(stateName, eventName);

  if (isList) {
    const firstInstanceId = hri.random();
    const secondInstanceId = hri.random();

    return {
      stateMachine,
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

    return {
      stateMachine,
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
  config: NewRequestConfiguration
): ConfigRequest => {
  const { entity, isList, requestType, entities } = config;
  const [firstId, secondId] = Object.keys(entities[entity]?.instances ?? {});
  const { states } = entities[entity].stateMachine;
  const lastAddedKey = Number([Object.keys(states).length - 1]);
  const stateName = Object.keys(states)[lastAddedKey];
  const [event] = Object.keys(states[stateName].on);

  const body = JSON.stringify(requestBody);
  const response: ResponseDefinition | Array<ResponseDefinition> = isList
    ? [
        { entity, id: firstId },
        { entity, id: secondId },
      ]
    : { entity, id: firstId };

  let newRequest: ConfigRequest = {
    body,
    response,
  };

  if (requestType === "mutation") {
    if (Array.isArray(response)) {
      response.map((responsePart) => {
        responsePart.state = stateName;

        newRequest.stateChanges = [
          { entity, id: firstId, event },
          { entity, id: secondId, event },
        ];
      });
    } else {
      response.state = stateName;

      newRequest.stateChanges = [{ entity, id: firstId, event }];
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

  const newRequest = formatNewRequest(requestBody, {
    entity,
    isList,
    requestType,
    entities,
  });
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
