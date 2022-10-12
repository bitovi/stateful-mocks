import { createMachine, interpret } from "xstate";

export class StateMachine {
  interpreter: any;
  statesData: any;

  constructor(statesData, machine) {
    const _machine = createMachine({
      ...machine,
      predictableActionArguments: true,
    });

    this.interpreter = interpret(_machine).start();
    this.statesData = statesData;
  }

  refreshState(statesData, machine) {
    const currentState = this.getCurrentState();
    const newMachine = createMachine({
      ...machine,
      predictableActionArguments: true,
    });
    this.interpreter = interpret(newMachine).start(currentState);
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
