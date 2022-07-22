import casual from "casual";
import fs from "fs";
import { parse } from "graphql";
import { ServerError } from "../errors/serverError";
import { getMock } from "../generator";
import { ConfigRequest } from "../interfaces/graphql";
import { getConfig, getTypeDefs } from "./graphql";

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

export const updateConfig = (
  request: ConfigRequest,
  requestName: string,
  requestType: string,
  configFilePath: string,
  schemaFilePath: string,
  isList: boolean
) => {
  const config = getConfig(configFilePath);
  let { requests, entities } = config;
  const schema = getTypeDefs(schemaFilePath);

  const entity = getEntityName(requestName, requestType, schema);

  const [entityInstance] = Object.keys(entities[entity]?.instances ?? {});

  //todo: refactor; this is quite crude
  if (entityInstance) {
    const [entityStates] = Object.keys(entities[entity].stateMachine.states);

    const body = JSON.stringify(request.body);
    const response = {
      id: entityInstance,
      entity,
      state: entityStates,
    };
    //todo: refactor this; too similar logic
    let newRequest: ConfigRequest = {
      body,
      response: isList ? [response] : response,
    };

    if (requestType === "mutation") {
      newRequest.stateChanges = [
        {
          id: entityInstance,
          event: requestName,
          entity,
        },
      ];
    }

    requests.push(newRequest);
  } else {
    const mock = getMock({
      schema,
      entity,
    });

    const initialState = casual.word;
    const entityInstanceId = casual.word;

    entities = {
      [entity]: {
        stateMachine: {
          id: casual.word,
          initial: initialState,
          states: {
            [initialState]: {
              on: {
                [casual.word]: initialState,
              },
            },
          },
        },
        instances: {
          [entityInstanceId]: {
            statesData: {
              [initialState]: mock,
            },
          },
        },
      },
    };

    const body = JSON.stringify(request.body);

    const response = {
      id: entityInstanceId,
      entity,
      state: initialState,
    };

    let newRequest: ConfigRequest = {
      body,
      response: isList ? [response] : response,
    };

    if (requestType === "mutation") {
      newRequest.stateChanges = [
        {
          id: entityInstance,
          event: requestName,
          entity,
        },
      ];
    }
    requests.push(newRequest);
  }

  config.entities = entities;
  config.requests = requests;

  writeNewConfig(config, configFilePath);
};

const writeNewConfig = (config, configFilePath: string) => {
  fs.writeFile(
    configFilePath,
    JSON.stringify(config, null, 3),
    function writeJSON(error) {
      if (error) {
        throw new ServerError();
      }
    }
  );
};

export const validateConfig = (configFilePath: string): void => {
  const absolutePath = `${process.cwd()}/${configFilePath}`;
  const validPath = fs.existsSync(absolutePath);

  if (!validPath) {
    ensureFileDirectoryExits(configFilePath);
    const config = {
      entities: {},
      requests: [],
    };
    writeNewConfig(config, configFilePath);
  }
};

const ensureFileDirectoryExits = (filePath: string) => {
  if (filePath.includes("/")) {
    const directoriesPath = filePath.substr(0, filePath.lastIndexOf("/"));

    fs.mkdirSync(directoriesPath, { recursive: true });
  }
};
