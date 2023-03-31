const { parse } = require("graphql");

const getTypeDefinition = (schema, type) => {
  return schema.definitions.find(
    (definition) => definition.name.value === type
  );
};
const recursivelyGetFields = (schema, fields) => {
  return fields.map(({ name, type }) => {
    const { value } = type?.type?.name ?? type.name;
    const fieldName = name.value;

    if (isNativeGraphqlType(value)) {
      return fieldName;
    } else {
      const entityTypeDefinition = getTypeDefinition(schema, value);
      const recursiveFields = recursivelyGetFields(
        schema,
        entityTypeDefinition.fields
      );

      return `${fieldName}{${recursiveFields.join(" ")}}`;
    }
  });
};

const isNativeGraphqlType = (type) => {
  const nativeGraphqlTypes = ["String", "Int", "Float", "Boolean", "ID"];

  return nativeGraphqlTypes.includes(type);
};

const getEntityFields = (schema, entity) => {
  const parsedSchema = parse(schema);
  const entityTypeDefinition = getTypeDefinition(parsedSchema, entity);

  return recursivelyGetFields(parsedSchema, entityTypeDefinition.fields);
};

const formatFields = (fields) => {
  let splitFields = fields.split(",").join(" ");
  splitFields = splitFields.replaceAll("[", "{");
  splitFields = splitFields.replaceAll("]", "}");

  return splitFields;
};

module.exports = {
  getEntityFields,
  formatFields,
};
