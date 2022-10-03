#!/usr/bin/env node
const { Command } = require("commander");
const { run, gen } = require("./actions");
const {
  CONFIG_FILE_PATH,
  SCHEMA_FILE_PATH,
  PORT,
  QUICK_STARTS,
} = require("./constants.js");
const { ensureFileExists } = require("../dist/utils/config/validation");
const { addScriptToPackageJson } = require("../dist/utils/io");
const { ServerError } = require("../dist/errors/serverError");

const program = new Command();

const schemaOptions = ["-s, --schema <path>", "Path to GraphQL schema"];
const entityOptions = [
  "-e, --entity <name>",
  "Entity to generate mock data for",
];
const fieldsOptions = [
  "-f, --fields <fields>",
  "Comma-separated list of fields to mock",
];

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

  const { configFilePath, schemaFilePath, port, startingConfig } =
    await inquirer.default.prompt([
      {
        name: "configFilePath",
        message: "Config file path? (Will overwrite if exists)",
        default: CONFIG_FILE_PATH,
      },
      {
        name: "schemaFilePath",
        message: "Schema file path? (Will overwrite if exists)",
        default: SCHEMA_FILE_PATH,
      },
      {
        name: "port",
        message: "Port number?",
        type: "number",
        default: PORT,
      },
      {
        name: "startingConfig",
        message: "Choose a starting config:",
        type: "list",
        choices: ["Empty", "User Admin"],
      },
    ]);

  const quickStart = QUICK_STARTS[startingConfig];

  if (!quickStart || !quickStart.config) {
    throw new ServerError(
      `Sorry, couldn't find this quick start configuration: "${startingConfig}"`
    );
  }

  const { config, schema = "" } = quickStart;

  await ensureFileExists(configFilePath, JSON.stringify(config, null, "\t"));
  await ensureFileExists(schemaFilePath, schema);

  await addScriptToPackageJson(configFilePath, schemaFilePath, port);
};

program
  .command("init")
  .description("CLI to generate quick start sms")
  .action(initSms);

program
  .command("gen")
  .description("CLI to generate mock data for an entity of a GraphQL schema")
  .requiredOption(...schemaOptions)
  .requiredOption(...entityOptions)
  .option(...fieldsOptions)
  .action(gen);

program.parse();
