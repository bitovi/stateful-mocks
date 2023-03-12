import { dirSync } from "tmp";
import { ApolloServer, ExpressContext } from "apollo-server-express";
import { Server } from "http";
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
  await execute("npm", "init -y", temporaryDirectoryName);
  await execute(
    "npm",
    "install @bitovi/stateful-mocks",
    temporaryDirectoryName
  );
});

afterAll(async () => {
  server?.httpServer?.close();
  temporaryDirectory.removeCallback();
});

describe("Init command", () => {
  test("Should create correct default sms setup", async () => {
    const { ENTER, DOWN } = directionsUnicode;
    await executeWithInput(
      "npx",
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

  test("Should return entity with gen command", async () => {
    const result = await execute(
      "npx",
      "sms gen -s ./mocks/schema.graphql -e Account",
      temporaryDirectoryName
    );

    expect(JSON.parse(result)).toMatchObject({
      id: expect.any(Number),
      name: expect.any(String),
      email: expect.any(String),
      password: expect.any(String),
      token: expect.any(String),
    });
  });

  test("Should return a new entity after schema update with gen command", async () => {
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

    const result = await execute(
      "npx",
      "sms gen -s ./mocks/schema.graphql -e Person",
      temporaryDirectoryName
    );

    expect(JSON.parse(result)).toMatchObject({
      age: expect.any(Number),
      name: expect.any(String),
    });
  });
});
