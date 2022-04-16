const { ApolloServer } = require('apollo-server');
const typeDefs = require('./schema')

const people = []

const resolvers = {
  Query: {
    personByName(_, { name }) {
      return people.find(p => p.name === name)
    }
  },
  Mutation: {
    createPerson(_, { input: person }) {
      people.push(person)
      return person
    }
  }
};

const server = new ApolloServer({ typeDefs, resolvers });

server.listen().then(({ url }) => {
  console.log(`{ "status": "listening", "url": "${url}" }`)
});
