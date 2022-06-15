const { StateMachine } = require('./stateMachine.js');

function generateControllersFromConfig({ entities }) {
  return Object.keys(entities).map((key) => {
    const instances = Object.keys(entities[key].instances).map((instanceId) => {
      const { statesData, stateMachine } = entities[key].instances[instanceId];

      return {
        id: instanceId,
        stateMachine: new StateMachine(statesData, stateMachine),
      };
    });

    return { entity: key, instances };
  });
}

module.exports = { generateControllersFromConfig };
