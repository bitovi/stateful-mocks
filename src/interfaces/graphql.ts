export interface ResponseDefinition {
  id: string;
  entity: string;
  state?: string;
}

export interface StateChangesDefinition {
  id: string;
  event: string;
  entity: string;
}

export interface ConfigRequest {
  body: string;
  response: ResponseDefinition /* | Array<ResponseDefinition> */;
  stateChanges: Array<StateChangesDefinition>;
}

//todo: find correct type for query or generate with tool
export interface GraphqlRequestBody {
  query: unknown;
  variables: { [key: string]: any };
  operationName: string;
}

export interface Machine {
  id: string;
  initial: string;
  states: { [key: string]: any };
}

interface Entity {
  stateMachine: Machine;
  instances: { [key: string]: unknown };
}

export interface Config {
  entities: { [key: string]: Entity };
  requests: Array<ConfigRequest>;
}
