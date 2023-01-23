const { readFileSync } = require("fs");
const path = require("path");
const { getMocks } = require("../dist/generator");
const { getEntityFields, formatFields } = require("./utils");

const gen = async ({ schema: schemaFilePath, entity, fields }) => {
  const schema = readFileSync(path.join(process.cwd(), schemaFilePath), "utf8");
  const entityFields = fields
    ? formatFields(fields)
    : getEntityFields(schema, entity);

  const newSchema =
    schema +
    `
  type Query {
    query${entity}: ${entity}
  }  
  `;
  const { query, variables } = {
    query: `query Query { query${entity} { ${entityFields} } }`,
    variables: {},
  };
  const mock = await getMocks({ query, schema: newSchema, variables });
  console.log(JSON.stringify(mock, null, "  "));

  return mock;
};

const run = ({ schema: schemaFilePath, config: configFilePath, port }) => {
  const { startApolloServer } = require("../dist/server");
  startApolloServer(configFilePath, schemaFilePath, port);
};

module.exports = { gen, run };
