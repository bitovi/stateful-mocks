const { spawn } = require("child_process");
const { readFileSync } = require("fs");
const path = require("path");
const { getMock } = require("../src/generator");

const gen = ({ schema: schemaFilePath, entity, fields }) => {
  const schema = readFileSync(path.join(process.cwd(), schemaFilePath), "utf8");
  const mock = getMock({
    schema,
    entity,
    fields: fields && fields.split(","),
  });
  console.log(JSON.stringify(mock, null, "  "));
};

const run = ({ schema: schemaFilePath, config: configFilePath, port }) => {
  console.info("Starting mock server...");

  const child = spawn("node", [
    "src/server.js",
    JSON.stringify({ port, configFilePath, schemaFilePath }),
  ]);

  child.stdout.on("data", (data) => {
    console.log(data.toString());
  });

  child.stderr.on("data", (data) => {
    console.error(data.toString());
  });
};

module.exports = { gen, run };
