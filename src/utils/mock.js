const { parse } = require("graphql");
const casual = require("casual");

const generateData = ({ name, type }) => {
  switch (type) {
    case "String":
      name = casual[name] || casual.word;
      break;

    case "Int":
      name = casual[name] || casual.integer(1, 100);
      break;

    case "Float":
      name = casual[name] || casual.double(1, 100);
      break;
  }

  return name;
};

const getMockFieldsData = ({ typeFields, selectedFields, schema }) => {
  const data = typeFields.reduce((mockFields, field) => {
    if (field.kind === "FieldDefinition") {
      const name = field.name.value;

      if (!selectedFields || selectedFields[name]) {
        if (field.type.kind === "NamedType") {
          mockFields[name] = getMock({
            schema,
            entity: field.type.name.value,
          });
        } else {
          const type = field.type.type.name.value;
          mockFields[name] = generateData({ name, type });
        }
      }
    }

    return mockFields;
  }, {});

  return data;
};

const getMock = ({ schema, entity, fields }) => {
  const ast = parse(schema);

  const typeFields = ast.definitions.find(
    (def) => def.name.value === entity
  ).fields;

  // TODO - Cater for nested selection
  const selectedFields =
    fields &&
    fields.reduce((selectFields, field) => {
      selectFields[field] = 1;

      return selectFields;
    }, {});

  const mocks = getMockFieldsData({ typeFields, selectedFields, schema });

  return mocks;
};

module.exports = { getMock };
