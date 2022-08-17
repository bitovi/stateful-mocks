export interface ResponseDefinition {
  id: string;
  entity: string;
  state?: string;
}

export interface StateChangeDefinition {
  id: string;
  event: string;
  entity: string;
}

//todo: correct type is GraphqlRequestBody, but sometimes will also be a string. Need two interfaces.
export interface ConfigRequest {
  body: any;
  response: ResponseDefinition | Array<ResponseDefinition>;
  stateChanges?: Array<StateChangeDefinition>;
}

//todo: find correct type for query or generate with tool
export interface GraphqlRequestBody {
  query: unknown;
  variables: Record<string, unknown>;
  operationName?: string;
}

export interface Machine {
  initial: string;
  states: Record<string, any>;
}

export interface Entity {
  stateMachine: Machine;
  instances: Record<string, Instance>;
}

type Instance = {
  statesData: Record<string, any>;
};

export type Entities = Record<string, Entity>;

export interface Config {
  entities: Entities;
  requests: Array<ConfigRequest>;
}

export interface RequestSpecifications {
  name: string;
  type: string;
}

export interface Variables {
  input: Record<string, unknown>;
}
