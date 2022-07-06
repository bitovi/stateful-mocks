import { ApolloServer } from 'apollo-server-express';
import { ApolloServerPluginDrainHttpServer } from 'apollo-server-core';
import express from 'express';
import http from 'http';
import bodyParser from 'body-parser';

import { generateControllers } from './utils/state/stateController';
import { getConfig, getTypeDefs } from './utils/graphql';
import { buildResolvers } from './utils/graphql/resolvers';
import { interceptNewRequest } from './middlewares/interceptNewRequest';

const [_, _cmd, port = 4000] = process.argv;

export async function startApolloServer(port: number) {
  const config = getConfig();
  const typeDefs = getTypeDefs();

  const { requests, entities } = config;

  const stateControllers = generateControllers(entities);

  const resolvers = buildResolvers(requests, stateControllers);

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
  app.use(interceptNewRequest);

  server.applyMiddleware({ app });
  await new Promise((resolve: any) => httpServer.listen({ port }, resolve));

  console.log(
    `🚀 Server ready at http://localhost:${port}${server.graphqlPath}`
  );
}

startApolloServer(Number(port));
