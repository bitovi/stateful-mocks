import { ApolloServer } from 'apollo-server-express';
import { ApolloServerPluginDrainHttpServer } from 'apollo-server-core';
import express from 'express';
import http from 'http';
import bodyParser from 'body-parser';
import fs from 'fs';
import path from 'path';
import { DocumentNode, parse } from 'graphql';

import { generateControllersFromConfig } from './utils/stateController';
import { getEntityInstance } from './utils/stateMachine';

// TODO - pass these as an argument
const configFilePath = '../demo/config';
const schemaFilePath = '../demo/schema.graphql';
const [_, _cmd, port = 4000] = process.argv;

export async function startApolloServer(port: number) {
  const config = require(configFilePath);
  const { requests } = config;
  const typeDefs = fs.readFileSync(
    path.join(__dirname, schemaFilePath),
    'utf8'
  );

  const stateControllers = generateControllersFromConfig(config);

  const resolvers = requests.reduce(
    (resolvers, request) => {
      const parsed: DocumentNode = parse(JSON.parse(request.body).query);

      //todo: fix this, the correct type is probably OperationDefinitionNode from graphql
      const definition: any = parsed.definitions[0];

      const queryOrMutationName =
        definition.selectionSet.selections[0].name.value;

      switch (definition.operation) {
        case 'query':
          return {
            ...resolvers,
            Query: {
              ...resolvers.Query,
              [queryOrMutationName]() {
                // TODO - compare request.variables
                const { entity, id } = request.response;

                const entityInstance = getEntityInstance(
                  stateControllers,
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
              [queryOrMutationName]() {
                request.stateChanges.forEach(({ id, event, entity }) => {
                  // TODO - compare request.variables
                  const entityInstance = getEntityInstance(
                    stateControllers,
                    entity,
                    id
                  );

                  entityInstance.send(event);
                });

                const { id, entity, state } = request.response;
                const entityInstance = getEntityInstance(
                  stateControllers,
                  entity,
                  id
                );

                return entityInstance.getStateData(state);
              },
            },
          };
      }

      return resolvers;
    },
    { Query: {}, Mutation: {} }
  );

  const app = express();
  const httpServer = http.createServer(app);
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    csrfPrevention: true,
    cache: 'bounded',
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  });

  await server.start();

  app.use(bodyParser.json());

  server.applyMiddleware({ app });
  await new Promise((resolve: any) => httpServer.listen({ port }, resolve));

  console.log(
    `🚀 Server ready at http://localhost:${port}${server.graphqlPath}`
  );
}

startApolloServer(Number(port));
