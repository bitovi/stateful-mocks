# Tour the Stateful Mocks Quick Start App

This section will give you a quick tour of the built-in schema and config for the User Admin option.

- **Schema:**

If you’re not familiar with GraphQL’s schema, GraphQL’s documentation may also prove useful: [Schemas and Types | GraphQL](https://graphql.org/learn/schema/).

For the User Admin example’s schema we have:

- **One object type**, `Account`:

```graphql
type Account {
  id: Int!
  name: String!
  email: String!
  password: String!
  token: String
}
```

- **Two query types** `accounts` and `accountById`:

```graphql
type Query {
  accountById(id: Int): Account
  accounts: [Account]
}
```

- **accountById** takes an id as input and returns an `Account`.
- **accounts** Takes no inputs and returns an array of `Account` objects. By default, when querying for an array, we’ll mock two instances of its returned type.

- **Three input types:** `CreateAccountInput`, `UpdateAccountNameInput` and `UpdateAccountPasswordInput`:

```graphql
input CreateAccountInput {
  name: String!
  email: String!
  password: String!
}

input UpdateAccountNameInput {
  id: Int!
  name: String!
}

input UpdateAccountPasswordInput {
  id: Int!
  password: Int!
}
```

Mutations often need inputs; though Stateful-mocks doesn’t take the actual input values into consideration when creating mock data, having different inputs for the same query will generate a different set of mocked data.

- **Four mutation types:** `createAccount`, `updateAccountName`, `updateAccountPassword` and `removeAccount`:

```graphql
type Mutation {
  createAccount(input: CreateAccountInput!): Account
  updateAccountName(input: UpdateAccountNameInput!): Account
  updateAccountPassword(input: UpdateAccountPasswordInput!): Account
  removeAccount(id: Int!): Account
}
```

- All of these mutations will take specific inputs and return an Account.

The first time you make a request with a unique input, stateful-mocks will save this request in your configuration file and give you a new set of mock data that matches the interface of the return of that request.

## Config.json

The configuration file returned by the user admin contains two instances, John and Mark, and three possible state transitions for them.

### Entities

The entities property is an object with Graphql’s entities’ names as keys. Since our GraphQL schema only has one Object type, `Account`. `Account` is also our only entity. An entity is composed of:

- **State machine:** the state machine is used to define state transitions rules. We use XState’s conventions: . Each entity will have a different state machine, but the instance’s share the state machines rules.

```json
{
"stateMachine": {
    "initial": "empty",
    "states": {
     "empty": {
      "on": {
       "create": "created"
      }
     },
     "created": {
      "on": {
       "updateName": "updatedName",
       "updatePassword": "updatedPassword",
       "remove": "empty"
      }
    },
    ...
  },
}
```

- **Instances:**

```json
"instances": {
  "John": {
    "statesData": {
    "created": {
      "id": 1,
      "name": "John Doe",
      "email": "john@mail.com",
      "password": "johnPass"
    },
    "updatedName": {
      "id": 1,
      "name": "John Duck",
      "email": "john@mail.com",
      "password": "johnPass"
    },
    "updatedPassword": {
      "id": 1,
      "name": "John Doe",
      "email": "john@mail.com",
      "password": "johnNewPass"
    }
    }
  },
  "Mark": {
    "statesData": {
    "created": {
      "id": 2,
      "name": "Mark Swain",
      "email": "markh@mail.com",
      "password": "markPass"
    },
    "updatedName": {
      "id": 2,
      "name": "Mark Louis",
      "email": "markh@mail.com",
      "password": "markPass"
    },
    "updatedPassword": {
      "id": 2,
      "name": "Mark Swain",
      "email": "markh@mail.com",
      "password": "markNewPass"
    }
  }
}
```

You may have as many instances of an entity as you wish, the states you query for must represent a set of mocked data under the instance.

The User Admin example comes with two instances, John and Mark. John and Mark share the same number of states (statesData) because they are of the same entity type, but each one of them have their own set of data.
