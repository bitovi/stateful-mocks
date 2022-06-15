const fs = require('fs');
const path = require('path');
const { ApolloServer } = require('apollo-server');
const { getEntityInstance } = require('./utils/stateMachine');
const { generateControllersFromConfig } = require('./utils/stateController');

// TODO - pass these as an argument
const configFilePath = '../demo/config';
const schemaFilePath = '../demo/schema.graphql';
const [_, cmd, port = 4000] = process.argv;

const config = require(configFilePath);
const { requests } = config;
const typeDefs = fs.readFileSync(path.join(__dirname, schemaFilePath), 'utf8');

//TODO: Improve the name of this constant, and many more. We need a consistent nomeclature for our objects/props
const stateController = generateControllersFromConfig(config);

const resolvers = requests.reduce(
  (resolvers, request) => {
    switch (request.operation) {
      case 'query':
        return {
          ...resolvers,
          Query: {
            ...resolvers.Query,
            [request.operationName]() {
              // TODO - compare request.variables
              const { entity, id } = request.data;
              const entityInstance = getEntityInstance(
                stateController,
                entity,
                id
              );

              return entityInstance.getCurrentStateData();
            },
          },
        };
      case 'mutation':
        return {
          ...resolvers,
          Mutation: {
            ...resolvers.Mutation,
            [request.operationName]() {
              request.stateChanges.forEach(({ id, state, entity }) => {
                // TODO - compare request.variables
                const entityInstance = getEntityInstance(
                  stateController,
                  entity,
                  id
                );

                entityInstance.setCurrentState(state);
              });
              const { id, entity } = request.data;
              const entityInstance = getEntityInstance(
                stateController,
                entity,
                id
              );

              return entityInstance.getCurrentStateData();
            },
          },
        };
    }

    return resolvers;
  },
  { Query: {}, Mutation: {} }
);

const server = new ApolloServer({ typeDefs, resolvers });

server.listen({ port }).then(({ url }) => {
  console.log(`{ "status": "listening", "url": "${url}" }`);
});
