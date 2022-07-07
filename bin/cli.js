#!/usr/bin/env node

const { Command } = require("commander");
const { gen, run } = require("./actions");

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

program
  .command("gen")
  .description("CLI to generate mock data for an entity of a GraphQL schema")
  .requiredOption(...schemaOptions)
  .requiredOption(...entityOptions)
  .option(...fieldsOptions)
  .action(gen);

program.parse();
