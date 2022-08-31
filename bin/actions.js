const { readFileSync } = require("fs");
const { parse } = require("graphql");
const path = require("path");
const { getMocks } = require("../dist/generator");

const getEntityFields = (entity, schema) => {
  const parsedSchema = parse(schema);
  const entityDefinition = parsedSchema.definitions.find(
    (definition) => definition.name.value === entity
  );
  const fields = entityDefinition.fields.map((field) => field.name.value);

  return fields;
};

const formatFields = (fields) => fields.split(",").join(" ");

const gen = async ({ schema: schemaFilePath, entity, fields }) => {
  const schema = readFileSync(path.join(process.cwd(), schemaFilePath), "utf8");
  const entityFields = fields
    ? formatFields(fields)
    : getEntityFields(entity, schema);

  const newSchema =
    schema +
    `
  type Query {
    query${entity}: ${entity}
  }  
  `;

  const { query, variables } = {
    query: `query Query { query${entity} { ${entityFields} } }`,
    variables: {}
  };
  const mock = await getMocks({ query, schema: newSchema, variables });
  console.log(JSON.stringify(mock, null, "  "));
};

const run = ({ schema: schemaFilePath, config: configFilePath, port }) => {
  const { startApolloServer } = require("../dist/server");
  startApolloServer(configFilePath, schemaFilePath, port);
};

module.exports = { gen, run };
