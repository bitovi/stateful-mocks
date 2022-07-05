import { ApolloServer } from 'apollo-server-express';
import { ApolloServerPluginDrainHttpServer } from 'apollo-server-core';
import express from 'express';
import http from 'http';
import bodyParser from 'body-parser';
import { DocumentNode, parse } from 'graphql';

import { generateControllers } from './utils/state/stateController';
import { getEntityInstance } from './utils/state/stateMachine';
import { getConfig, getTypeDefs } from './utils/graphql';

const [_, _cmd, port = 4000] = process.argv;

export async function startApolloServer(port: number) {
  const config = getConfig();
  const typeDefs = getTypeDefs();

  const { requests, entities } = config;

  const stateControllers = generateControllers(entities);

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
