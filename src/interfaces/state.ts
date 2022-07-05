export interface Interpreter {
  id: string;
}

export interface StatesData {
  [key: string]: any;
}

export interface StateController {
  entity: string;
  instances: Array<Instance>;
}

export interface Instance {
  id: string;
  stateMachine: StateMachine;
}

export interface StateMachine {
  interpreter: Interpreter;
  statesData: StatesData;
}
