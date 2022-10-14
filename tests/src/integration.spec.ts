import { ApolloServer, ExpressContext } from "apollo-server-express";
import { Server } from "http";
import request from "supertest";
import graphql from "superagent-graphql";
import { buildApolloServer } from "../../src/server";

let servers: {
  apolloServer: ApolloServer<ExpressContext>;
  httpServer: Server;
};

jest.mock("../../src/utils/io.ts");

beforeAll(async () => {
  servers = await buildApolloServer(
    "./config.json",
    "./tests/resources/testSchema.graphql"
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
  });

  test("Test Query", async () => {
    const response = await request(servers.httpServer)
      .post("/graphql")
      .use(
        graphql(
          `
            query Query {
              test {
                text
                score
              }
            }
          `
        )
      );

    expect(JSON.parse(response.text)).toStrictEqual({
      data: {
        test: {
          text: expect.any(String),
          score: expect.any(Number),
        },
      },
    });
  });
});
