const { mockServer } = require("@graphql-tools/mock");
const casual = require("casual");
const { parse } = require("graphql");

const generateData = ({ name, type }) => {
  switch (type) {
    case "string":
      return casual[name] || casual.word;

    case "number":
      return casual[name] || casual.integer(1, 100);
  }

  return name;
};

const getMock = (data) => {
  for (const fieldName in data) {
    if (Array.isArray(data[fieldName])) {
      data[fieldName] = data[fieldName].map((element) => {
        const type = typeof element;

        if (["string", "number"].includes(type)) {
          element = generateData({ name: fieldName, type });
        } else {
          element = getMock(element);
        }

        return element;
      });
    } else {
      const type = typeof data[fieldName];

      if (["string", "number"].includes(type)) {
        data[fieldName] = generateData({ name: fieldName, type });
      } else {
        data[fieldName] = getMock(data[fieldName]);
      }
    }
  }

  return data;
};

const resolveScalars = (schema) => {
  const ast = parse(schema);

  let scalars = {};

  ast.definitions
    .filter((def) => def.kind === "ScalarTypeDefinition")
    .forEach((scalar) => {
      scalars[scalar.name.value] = () => "scalar";
    });

  return scalars;
};

const getMocks = async ({ query, schema }) => {
  try {
    const server = mockServer(schema, resolveScalars(schema));

    const initialQueryData = await server.query(query, {});

    const mockedData = getMock(initialQueryData);

    return mockedData;
  } catch (error) {
    console.error(error);
  }
};

module.exports = { getMocks };
