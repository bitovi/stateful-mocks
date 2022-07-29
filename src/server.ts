import { ApolloServer } from "apollo-server-express";
import { ApolloServerPluginDrainHttpServer } from "apollo-server-core";
import express from "express";
import http from "http";
import bodyParser from "body-parser";

import { getFile } from "./utils/graphql";
import { buildResolvers } from "./utils/graphql/resolvers";
import { interceptNewRequest } from "./middlewares/interceptNewRequest";
import { ensureConfigFileExists } from "./utils/config";

export async function startApolloServer(
  configFilePath: string,
  schemaFilePath: string,
  port: number = 4000
) {
  ensureConfigFileExists(configFilePath);

  const schema = getFile(schemaFilePath);
  const resolvers = buildResolvers(configFilePath, schemaFilePath);

  const app = express();
  const httpServer = http.createServer(app);
  const server = new ApolloServer({
    typeDefs: schema,
    resolvers,
    csrfPrevention: true,
    cache: "bounded",
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  });

  await server.start();

  app.use(bodyParser.json());
  app.use(async (request, response, next) => {
    await interceptNewRequest(
      request,
      response,
      configFilePath,
      schemaFilePath
    );
    next();
  });

  server.applyMiddleware({ app });
  await new Promise((resolve: any) => httpServer.listen({ port }, resolve));

  console.log(
    `🚀 Server ready at http://localhost:${port}${server.graphqlPath}`
  );
}
