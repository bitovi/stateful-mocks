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

//todo: correct type is GraphqlRequestBody, but sometimes will also be a string. Need two interfaces.
export interface ConfigRequest {
  body: any;
  response: ResponseDefinition | Array<ResponseDefinition>;
  stateChanges?: Array<StateChangesDefinition>;
}

//todo: find correct type for query or generate with tool
export interface GraphqlRequestBody {
  query: unknown;
  variables: { [key: string]: any };
  operationName?: string;
}

export interface Machine {
  initial: string;
  states: { [key: string]: any };
}

export interface Entity {
  stateMachine: Machine;
  instances: /* { [key: string]: Instance }; */ any;
}

//todo: fix instance type
type Instance = {
  statesData: { [key: string]: unknown };
};

export interface Config {
  entities: { [key: string]: Entity };
  requests: Array<ConfigRequest>;
}

export interface RequestSpecifications {
  name: string;
  type: string;
}
