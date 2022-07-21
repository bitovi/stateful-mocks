const { readFileSync } = require("fs");
const path = require("path");
const { getMock } = require("../dist/generator");

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
  const { startApolloServer } = require("../dist/server");
  startApolloServer(configFilePath, schemaFilePath, port);
};

module.exports = { gen, run };
 