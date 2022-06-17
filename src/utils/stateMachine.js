const { createMachine, interpret } = require("xstate");

class StateMachine {
  constructor(statesData, machine) {
    this.statesData = statesData;
    this.machine = createMachine(machine);
    this.interpreter = interpret(this.machine).start();
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

function getEntityInstance(controllers, entityType, instanceId) {
  return controllers
    .find((controller) => controller.entity === entityType)
    .instances.find((instance) => instance.id === instanceId).stateMachine;
}

module.exports = {
  StateMachine,
  getEntityInstance,
};
