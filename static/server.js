const fs = require("fs")
const path = require("path")
const { ApolloServer } = require("apollo-server")
const { parse } = require("graphql")

// TODO - pass these as an argument
const configFilePath = "../demo/config"
const schemaFilePath = ("../demo/schema.graphql")
const [ _, cmd, port = 4000 ] = process.argv

const config = require(configFilePath)
const { entities, requests } = config

const typeDefs = fs.readFileSync(path.join(__dirname, schemaFilePath), 'utf8')

const entitiesState = entities.map(({name, instances}) => {
  return {
    name,
    instances: instances.map(({id}) => ({
      id,
      state: null
    }))
  }
})

const getEntityState = (name, id, state) => {
  return entities
    .find(e => e.name === name)
    .instances
    .find(i => i.id === id)
    .states
    .find(s => s.state === state)
    ?.data
}

const getEntityCurrentState = (name, id) => {
  const currentState = entitiesState
    .find(e => e.name === name)
    .instances
    .find(i => i.id === id)
    .state

  return getEntityState(name, id, currentState)
}

const setEntityState = (name, id, state) => {
  const instance = entitiesState
    .find(e => e.name === name)
    .instances
    .find(i => i.id === id)

  instance.state = state
}

const resolvers = requests.reduce((resolvers, request) => {
  const parsed = parse(JSON.parse(request.body).query)

  const definition = parsed.definitions[0]
  const queryOrMutationName = definition.selectionSet.selections[0].name.value

  switch(definition.operation) {
    case "query":
      return {
        ...resolvers,
        Query: {
          ...resolvers.Query,
          [queryOrMutationName]() {
            // TODO - compare request.variables

            const {name, id} = request.response
            return getEntityCurrentState(name, id)
          }
        }
      }
    case "mutation":
      return {
        ...resolvers,
        Mutation: {
          ...resolvers.Mutation,
          [queryOrMutationName]() {
            // TODO - compare request.variables

            request.stateChanges.forEach(({name, id, state}) => {
              setEntityState(name, id, state)
            })

            const {name, id, state} = request.response
            return getEntityState(name, id, state)
          }
        }
      }
  }

  return resolvers
}, { Query: {}, Mutation: {} })

const server = new ApolloServer({ typeDefs, resolvers });

server.listen({ port }).then(({ url }) => {
  console.log(`{ "status": "listening", "url": "${url}" }`)
});
