const { gql } = require('apollo-server');

const typeDefs = gql`
  type Person {
    name: String!
    age: Int!
  }

  type Query {
    personByName(name: String): Person
  }

  input CreatePersonInput {
    name: String!
    age: Int!
  }

  type Mutation {
    createPerson(input: CreatePersonInput!): Person
  }
`

module.exports = typeDefs
