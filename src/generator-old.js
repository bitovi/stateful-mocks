const { parse, buildSchema } = require('graphql')
const { createMockStore } = require('@graphql-tools/mock')
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

const getMocks = ({ ast, entity }) => {
  return ast.definitions.reduce((mocks, def) => {
    const isTypeDef =
      def.kind === 'ObjectTypeDefinition' &&
      def.name.value === entity &&
      def.name.value !== 'Query' &&
      def.name.value !== 'Mutation'

    if (isTypeDef) {
      const mockFields = def.fields.reduce((mockFields, field) => {
        const name = field.name.value
        const type = field.type.type?.name.value

        if (field.kind === 'FieldDefinition' && type) {
          mockFields[name] = () => generateData({ name, type })
        }

        return mockFields
      }, {})

      mocks[def.name.value] = mockFields
    }

    return mocks
  }, {})
}

const merge = (a, b) => {
  const aKeys = Object.keys(a)
  const bKeys = Object.keys(b)
  const merged = {}

  for (const key of aKeys) {
    if (!bKeys.includes(key)) {
      merged[key] = a[key]
    } else {
      if (typeof a[key] === 'object') {
        merged[key] = merge(a[key], b[key])
      }
    }
  }

  for (const key of bKeys) {
    if (!aKeys.includes(key)) {
      merged[key] = b[key]
    }
  }

  return merged
}

// turns { keys: [ 'foo', 'bar'], value: 'baz' }
// into { foo: { bar: 'baz' } }
// and
// turns { keys: [ 'foo', 'bar'], value: 'baz', data: { foo: { abc: 'xyz' } } }
// into { foo: { abc: 'xyz', bar: 'baz' } }
const generateNestedObjectWithValue = ({ keys, value, data }) => {
  const reversed = keys.reverse()

  const newData = reversed.slice(1).reduce(
    (newData, key) => {
      return {
        [key]: newData,
      }
    },
    { [reversed[0]]: value }
  )

  return merge(data, newData)
}

const getAllFieldsForEntity = ({ entity, ast }) => {
  console.log('entity =>', entity)
  const fields = ast.definitions.find((def) => def.name.value === entity).fields

  return fields.reduce((fields, field) => {
    console.log('field =>', field)
    console.log('field.name.value =>', field.name.value)
    // console.log('field.type.type.name.value =>', field.type.type.name.value)
    console.log('field.type.kind =>', field.type.kind)
    console.log('field.type.type =>', field.type.type)

    let nestedFields

    if (field.type.kind === 'NonNullType') {
      if (!isScalarType(field.type.type.name.value)) {
        console.log('hgjhj =>', field.type.type.name.value)
        nestedFields = getAllFieldsForEntity({
          entity: field.type.type.name.value,
          ast,
        }).map((nestedField) => `${field.name.value}.${nestedField}`)
      } else {
        nestedFields = [field.name.value]
        // if (field.type.type.kind === 'NamedType') {
        //   if (!isScalarType(field.type.type.name.value)) {
        //     nestedFields = getAllFieldsForEntity({
        //       entity: field.type.type.name.value,
        //       ast,
        //     }).map(
        //       (nestedField) => `${field.type.type.name.value}.${nestedField}`
        //     )
        //   }
        // }
      }
    }

    if (field.type.kind === 'NamedType') {
      if (!isScalarType(field.type.name.value)) {
        nestedFields = getAllFieldsForEntity({
          entity: field.type.name.value,
          ast,
        }).map((nestedField) => {
          console.log('so close =>', `${field.name.value}.${nestedField}`)
          return `${field.name.value}.${nestedField}`
        })
      } else {
        nestedFields = [field.name.value]
      }
    }

    if (field.type.kind === 'ListType') {
      if (!isScalarType(field.type.type.name.value)) {
        nestedFields = getAllFieldsForEntity({
          entity: field.type.type.name.value,
          ast,
        }).map((nestedField) => {
          console.log('address =>', `${nestedField}`)

          return `${nestedField}`
        })
      } else {
        nestedFields = [field.name.value]
      }
    }

    return [...fields, ...nestedFields]
  }, [])
}

const getMock = ({ schema, entity, fields }) => {
  const key = Math.random()

  const ast = parse(schema)
  const store = createMockStore({
    schema: buildSchema(schema),
    mocks: getMocks({ ast, entity }),
  })

  // if (!fields) {
  //   fields = getAllFieldsForEntity({ entity, ast })
  // }

  return fields.reduce((data, field) => {
    const splitField = field.split('.')

    return {
      ...data,
      ...generateNestedObjectWithValue({
        keys: splitField,
        value: store.get(entity, key, splitField),
        data,
      }),
    }
  }, {})
}

module.exports = { getMock }