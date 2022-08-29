const { Command } = require("commander");
const { run } = require("./actions");
const {
  CONFIG_FILE_PATH,
  SCHEMA_FILE_PATH,
  USER_ADMIN_GRAPHQL_SCHEMA,
  USER_ADMIN_CONFIG_JSON,
  PORT
} = require("./constants.js");
const { ensureFileExists } = require("../dist/utils/config/validation");
const { addScriptToPackageJson } = require("../dist/utils/io");

const program = new Command();
const schemaOptions = ["-s, --schema <path>", "Path to GraphQL schema"];

program
  .name("sms")
  .description("CLI for the stateful mocks server(sms)")
  .version("0.1.0");

program
  .command("run", { isDefault: true })
  .description("CLI to run mock server")
  .requiredOption(...schemaOptions)
  .requiredOption("-c, --config <path>", "Path to config")
  .option("-p, --port <port>", "Port to run mock server")
  .action(run);

const initSms = async () => {
  const inquirer = await import("inquirer");

  const { configFilePath, schemaFilePath, port } =
    await inquirer.default.prompt([
      {
        name: "configFilePath",
        message: "Config file path? (Will overwrite if exists)",
        default: CONFIG_FILE_PATH
      },
      {
        name: "schemaFilePath",
        message: "Schema file path? (Will overwrite if exists)",
        default: SCHEMA_FILE_PATH
      },
      {
        name: "port",
        message: "Port number?",
        type: "number",
        default: PORT
      },
      {
        name: "startingConfig",
        message: "Choose a starting config:",
        type: "list",
        choices: ["Empty", "User Admin"]
      }
    ]);

  await ensureFileExists(
    configFilePath,
    JSON.stringify(USER_ADMIN_CONFIG_JSON, null, "\t")
  );
  await ensureFileExists(schemaFilePath, USER_ADMIN_GRAPHQL_SCHEMA.schema);

  await addScriptToPackageJson(configFilePath, schemaFilePath, port);
};

program
  .command("init")
  .description("CLI to generate quick start sms")
  .action(initSms);

program.parse();
