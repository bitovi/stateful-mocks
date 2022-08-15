const { mockServer } = require("@graphql-tools/mock");
const casual = require("casual");
const { parse } = require("graphql");

const getFieldType = (
  field: string | number | { [key: string]: any }
): string => {
  let type: string = typeof field;

  if (typeof field === "number" && field % 1 !== 0) {
    type = "float";
  }

  return type;
};

const generateData = ({ name, type }: { name: string; type: string }) => {
  switch (type) {
    case "string":
      return casual[name] || casual.word;

    case "number":
      return casual[name] || casual.integer(1, 100);

    case "float":
      return casual[name] || casual.double(1, 100);
  }
};

const resolveTypeToData = ({
  fieldName,
  field,
}: {
  fieldName: string;
  field: string | number | { [key: string]: any };
}) => {
  const type = getFieldType(field);

  if (["string", "number", "float"].includes(type)) {
    return generateData({ name: fieldName, type });
  } else {
    return getMock(field as object);
  }
};

const getMock = (data: { [key: string]: any }) => {
  for (const fieldName in data) {
    if (Array.isArray(data[fieldName])) {
      data[fieldName] = data[fieldName].map((element) =>
        resolveTypeToData({ fieldName, field: element })
      );
    } else {
      data[fieldName] = resolveTypeToData({
        fieldName,
        field: data[fieldName],
      });
    }
  }

  return data;
};

const resolveScalars = (schema: string) => {
  const ast = parse(schema);

  let scalars = {};

  ast.definitions
    .filter((def) => def.kind === "ScalarTypeDefinition")
    .forEach((scalar) => {
      scalars[scalar.name.value] = () => "scalar";
    });

  return scalars;
};

const getMocks = async ({
  query,
  schema,
  variables,
}: {
  query: string;
  schema: string;
  variables?: {
    [key: string]: any;
  };
}) => {
  try {
    const server = mockServer(schema, resolveScalars(schema));

    let initialQueryData = (await server.query(query, variables)).data;

    initialQueryData = initialQueryData[Object.keys(initialQueryData)[0]];

    initialQueryData = JSON.parse(JSON.stringify(initialQueryData));

    return getMock(initialQueryData);
  } catch (error) {
    console.error(error);
  }
};

export { getMocks };
