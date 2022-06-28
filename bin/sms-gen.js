#!/usr/bin/env node

const { readFile } = require("fs/promises");
const path = require("path");
const { Command } = require("commander");
const { getMock } = require("../src/generator");

const program = new Command();

program
  .name("sms-gen")
  .description("CLI to generate mock data for an entity of a GraphQL schema")
  .version("0.1.0")
  .requiredOption("--schema <path>", "path to GraphQL schema")
  .requiredOption("--entity <name>", "Entity to generate mock data for")
  .option("--fields <fields>", "Comma-separated list of fields to mock")
  .parse();

(async () => {
  const { schema: schemaPath, entity, fields } = program.opts();
  const schema = await readFile(path.join(process.cwd(), schemaPath), "utf8");
  const mock = getMock({ schema, entity, fields: fields && fields.split(",") });
  console.log(JSON.stringify(mock, null, "  "));
})();
