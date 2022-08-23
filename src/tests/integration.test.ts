import { ApolloServer, ExpressContext } from "apollo-server-express";
import { Server } from "http";
import request from "supertest";
import graphql from "superagent-graphql";
import { buildApolloServer } from "../server";

let servers: {
  apolloServer: ApolloServer<ExpressContext>;
  httpServer: Server;
};

jest.mock("../utils/io.ts");

beforeAll(async () => {
  servers = await buildApolloServer(
    "./config.json",
    "src/tests/resources/testSchema.graphql"
  );
});

afterAll(() => {
  servers.httpServer.close();
});

describe("Integration Tests", () => {
  test("Test Person", async () => {
    const response = await request(servers.httpServer)
      .post("/graphql")
      .use(
        graphql(
          `
            mutation Mutation($input: CreatePersonInput!) {
              createPerson(input: $input) {
                name
                age
              }
            }
          `,
          {
            input: {
              name: "Mark Repka",
              age: 32,
            },
          }
        )
      );

    expect(JSON.parse(response.text)).toStrictEqual({
      data: {
        createPerson: {
          name: expect.any(String),
          age: expect.any(Number),
        },
      },
    });

    /*     const response2 = await request(servers.httpServer)
      .post("/graphql")
      .use(
        graphql(
          `
            query Query {
              people {
                name
                age
              }
            }
          `,
          null
        )
      );
 
    expect(response2.text).toBe({}); */
  });
});
