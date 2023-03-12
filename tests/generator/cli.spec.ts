import request from "supertest";
import graphql from "superagent-graphql";
import { dirSync } from "tmp";
import { ApolloServer, ExpressContext } from "apollo-server-express";
import { Server } from "http";
import { buildApolloServer } from "../../src/server";
import { directionsUnicode, execute, executeWithInput } from "./cmd-helper";
import { existsDirectory, readFile, writeFile } from "../../src/utils/io";

jest.mock("../../src/utils/io.ts", () => ({
  ...jest.requireActual("../../src/utils/io.ts"),
  watchConfigFile: jest.fn(),
}));

const temporaryDirectory = dirSync({
  unsafeCleanup: true,
});

const { name: temporaryDirectoryName } = temporaryDirectory;

const configPath = `${temporaryDirectoryName}/mocks/config.json`;
const schemaPath = `${temporaryDirectoryName}/mocks/schema.graphql`;

let server: {
  apolloServer: ApolloServer<ExpressContext>;
  httpServer: Server;
};

beforeAll(async () => {
  server;
  await execute("init -y", temporaryDirectoryName);
  await execute("install @bitovi/stateful-mocks", temporaryDirectoryName);
});

afterAll(async () => {
  server?.httpServer?.close();
  temporaryDirectory.removeCallback();
});

describe("Init command", () => {
  test("creates correct default sms setup", async () => {
    const { ENTER, DOWN } = directionsUnicode;
    await executeWithInput(
      "sms init",
      [configPath, ENTER, schemaPath, ENTER, "3000", ENTER, DOWN, ENTER],
      {
        shell: true,
        cwd: temporaryDirectoryName,
      }
    );

    const pkgString = await readFile(`${temporaryDirectoryName}/package.json`);
    const pkg = JSON.parse(pkgString);

    const isValidConfigPath = existsDirectory(configPath);
    const isValidSchemaPath = existsDirectory(schemaPath);

    expect(isValidConfigPath).toBe(true);
    expect(isValidSchemaPath).toEqual(true);
    expect(pkg.scripts).toHaveProperty("sms");
  });

  test("returns correct entity after schema update", async () => {
    const updatedSchema = `
      type Person {
        age: Int!
        name: String!
      }
      type Query {
        testRequest: Person
      }
      type Mutation {
        testMutation: Person
      }
    `;

    await writeFile(schemaPath, updatedSchema);

    server = await buildApolloServer(configPath, schemaPath);

    const response = await request(server.httpServer)
      .post("/graphql")
      .use(
        graphql(
          `
            query Query {
              testRequest {
                age
                name
              }
            }
          `
        )
      );

    expect(JSON.parse(response.text)).toStrictEqual({
      data: {
        testRequest: {
          age: expect.any(Number),
          name: expect.any(String),
        },
      },
    });
  });
});
