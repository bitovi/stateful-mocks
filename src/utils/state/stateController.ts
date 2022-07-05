import { StateController } from '../../interfaces/state';
import { StateMachine } from './stateMachine';

export function generateControllers(entities): Array<StateController> {
  return Object.keys(entities).map((key) => {
    const instances = Object.keys(entities[key].instances).map((instanceId) => {
      const { statesData } = entities[key].instances[instanceId];
      const { stateMachine } = entities[key];

      return {
        id: instanceId,
        stateMachine: new StateMachine(statesData, stateMachine),
      };
    });

    return { entity: key, instances };
  });
}
