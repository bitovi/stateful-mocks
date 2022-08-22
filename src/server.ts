import { ApolloServer, ExpressContext } from "apollo-server-express";
import fs from "fs";
import { ApolloServerPluginDrainHttpServer } from "apollo-server-core";
import express from "express";
import http, { Server } from "http";
import bodyParser from "body-parser";

import { getSchemaFile } from "./utils/graphql";
import { buildResolvers } from "./utils/graphql/resolvers";
import { interceptNewRequest } from "./middlewares/interceptNewRequest";
import {
  validateConfigFile,
  validateConfigFileFormat,
} from "./utils/config/validation";

export async function startApolloServer(
  configFilePath: string,
  schemaFilePath: string,
  port: number = 4000
) {
  fs.watch(configFilePath, "utf8", function (event, filename) {
    validateConfigFileFormat(configFilePath, () => {
      console.log("Your config.json format is incorrect.");
    });
  });

  const { apolloServer, httpServer } = await buildApolloServer(
    configFilePath,
    schemaFilePath
  );
  await new Promise((resolve: any) => httpServer.listen({ port }, resolve));

  console.log(
    `🚀 Server ready at http://localhost:${port}${apolloServer.graphqlPath}`
  );
}

export async function buildApolloServer(
  configFilePath: string,
  schemaFilePath: string
): Promise<{ apolloServer: ApolloServer<ExpressContext>; httpServer: Server }> {
  await validateConfigFile(configFilePath);

  const schema = getSchemaFile(schemaFilePath);
  const resolvers = buildResolvers(configFilePath, schemaFilePath);

  const app = express();
  const httpServer = http.createServer(app);
  const apolloServer = new ApolloServer({
    typeDefs: schema,
    resolvers,
    csrfPrevention: true,
    cache: "bounded",
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  });

  await apolloServer.start();

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

  apolloServer.applyMiddleware({ app });
  return { apolloServer, httpServer };
}
