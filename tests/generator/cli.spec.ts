import request from "supertest";
import concat from "concat-stream";
import graphql from "superagent-graphql";
import { spawn } from "cross-spawn";
import { dirSync } from "tmp";

import { buildApolloServer } from "../../src/server";
import { directionsUnicode, executeWithInput } from "./cmd-helper";
import { existsDirectory, readFile, writeFile } from "../../src/utils/io";

const temporaryDirectory = dirSync({
  unsafeCleanup: true,
});

const { name: temporaryDirectoryName } = temporaryDirectory;

const configPath = `${temporaryDirectoryName}/mocks/config.json`;
const schemaPath = `${temporaryDirectoryName}/mocks/schema.graphql`;

const execute = async (command, args, directory?: string) => {
  const childProcess = spawn(command, args, {
    cwd: directory,
  });

  const promise = new Promise((resolve, reject) => {
    childProcess.stderr.once("data", (err, data) => {
      childProcess.stdin.end();

      reject(err.toString());
    });

    childProcess.on("error", reject);

    childProcess.stdout.pipe(
      concat((result) => {
        resolve(result.toString());
      })
    );
  });

  return promise;
};

beforeAll(async () => {
  await execute(
    `npm init -y && npm`,
    ["install", "@bitovi/stateful-mocks"],
    temporaryDirectoryName
  );
});

afterAll(() => {
  temporaryDirectory.removeCallback();
});

describe("Init command", () => {
  test("creates correct files", async () => {
    const { ENTER, DOWN } = directionsUnicode;

    await executeWithInput(
      "npx sms init",
      [],
      [configPath, ENTER, schemaPath, ENTER, "3000", ENTER, DOWN, ENTER],
      {
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

    const updatedSchema = `type Account {
        id: Int!
        name: String!
        email: String!
        password: String!
        token: String
      } 

      type Person {
        age: Int!
        name: String!
      }

      type Query {
        accountById(id: Int): Account
        accounts: [Account]
        testRequest: Person
      }

      input CreateAccountInput {
        name: String!
        email: String!
        password: String!
      }

      input UpdateAccountNameInput {
        id: Int!
        name: String!
      }

      input UpdateAccountPasswordInput {
        id: Int!
        password: String!
      }

      type Mutation {
        createAccount(input: CreateAccountInput!): Account
        updateAccountName(input: UpdateAccountNameInput!): Account
        updateAccountPassword(input: UpdateAccountPasswordInput!): Account
        removeAccount(id: Int!): Account
      }
    `;

    writeFile(schemaPath, updatedSchema);

    const servers = await buildApolloServer(configPath, schemaPath);

    const response = await request(servers.httpServer)
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

    servers.httpServer.close();
  });
});
