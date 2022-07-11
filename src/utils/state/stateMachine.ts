import { createMachine, interpret } from "xstate";

export class StateMachine {
  interpreter: any;
  statesData: any;

  constructor(statesData, machine) {
    const _machine = createMachine(machine);
    this.interpreter = interpret(_machine).start();
    this.statesData = statesData;
  }

  getCurrentState() {
    return this.interpreter.state.value;
  }

  send(newState) {
    this.interpreter.send(newState);
  }

  getStateData(state) {
    return this.statesData[state];
  }

  getCurrentStateData() {
    const currentState = this.getCurrentState();
    return this.getStateData(currentState);
  }
}

export function getEntityInstance(controllers, entityType, instanceId) {
  return controllers
    .find((controller) => controller.entity === entityType)
    .instances.find((instance) => instance.id === instanceId).stateMachine;
}
