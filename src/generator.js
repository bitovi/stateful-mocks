const { parse } = require('graphql')
const casual = require('casual')

/**
 * Definitions - ['DirectiveDefinition', 'ObjectTypeDefinition', 'UnionTypeDefinition', 'InputObjectTypeDefinition', 'InterfaceTypeDefinition', 'EnumTypeDefinition', 'ScalarTypeDefinition']
 * ObjectTypeDefinition kinds - [ 'NamedType', 'NonNullType', 'ListType' ]
 * NamedType type names - [ 'String', 'ID', 'Boolean', 'Int', 'Float' ]
 */

const isScalarType = (type) =>
  ['String', 'ID', 'Boolean', 'Int', 'Float'].includes(type)

const generateData = ({ name, type }) => {
  switch (type) {
    case 'String':
      name = casual[name] || casual.word
      break

    case 'Int':
      name = casual[name] || casual.integer(1, 100)
      break

    case 'Float':
      name = casual[name] || casual.double(1, 100)
      break
  }

  return name
}

const getNamedType = (field) => {
  if (
    field.type.kind &&
    ['NonNullType', 'ListType'].includes(field.type.kind)
  ) {
    return getNamedType(field.type)
  }

  return field.type.name.value
}

const getKind = (field) => {
  if (field.type && field.type.type) {
    return getNamedType(field.type)
  }

  return field.kind
}

const resolveNamedType = ({ mockFields, schema, name, field }) => {
  const namedType = getNamedType(field)

  if (!isScalarType(namedType)) {
    mockFields[name] = getMock({
      entity: namedType,
      schema,
    })
  } else {
    mockFields[name] = generateData({ name, type: namedType })
  }

  return mockFields
}

const resolveListOFNamedTypes = ({ mockFields, schema, name, field }) => {
  return mockFields
}

const getMockFieldsData = ({ typeFields, selectedFields, schema }) => {
  const data = typeFields.reduce((mockFields, field) => {
    if (field.kind === 'FieldDefinition') {
      const name = field.name.value
      //   const type = field.type

      if (['NonNullType', 'NamedType'].includes(getKind(field.type))) {
        return resolveNamedType({
          mockFields,
          schema,
          name,
          field,
        })
      }

      if (getKind(field.type) === 'ListType') {
        console.log('field =>', field)
        if (getKind(field.type) === 'NamedType') {
          if (!isScalarType(getNamedType(field.type))) {
            mockFields[name] = [
              getMock({
                entity: getNamedType(field.type),
                schema,
              }),
              getMock({
                entity: getNamedType(field.type),
                schema,
              }),
            ]
          } else {
            mockFields[name] = generateData({
              name,
              type: getNamedType(field.type),
            })
          }
        } else if (getKind(field.type) === 'NonNullType') {
          if (!isScalarType(getNamedType(field.type))) {
            mockFields[name] = [
              getMock({
                entity: getNamedType(field.type),
                schema,
              }),
              getMock({
                entity: getNamedType(field.type),
                schema,
              }),
            ]
          } else {
            mockFields[name] = generateData({
              name,
              type: getNamedType(field.type),
            })
          }
        }
      }
    }

    return mockFields
  }, {})

  return data
}

const resolveUnion = ({ ast, types }) =>
  ast.definitions.find(
    (def) =>
      def.name.value ===
      types[Math.floor(Math.random() * types.length)].name.value
  ).fields

const getMock = ({ schema, entity, fields }) => {
  const ast = parse(schema)

  const definition = ast.definitions.find((def) => def.name.value === entity)

  const typeFields =
    definition.kind === 'UnionTypeDefinition'
      ? resolveUnion({
          ast,
          types: definition.types,
        })
      : definition.fields

  // TODO - Cater for nested selection
  const selectedFields =
    fields &&
    fields.reduce((selectFields, field) => {
      selectFields[field] = 1

      return selectFields
    }, {})

  //   if (entity === 'Item') {
  //     console.log('typeFields =>', typeFields)
  //     console.log('fields =>', fields)
  //   }

  const mocks = getMockFieldsData({ typeFields, selectedFields, schema })

  return mocks
}

module.exports = { getMock }
