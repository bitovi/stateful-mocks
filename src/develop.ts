import { startApolloServer } from "./server";

startApolloServer("./demo/config.json", "./demo/schema.graphql", 3000);
