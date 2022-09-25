exports.QUICK_STARTS = {
  "User Admin": {
    schema: `type Account {
  id: String!
  name: String!
  email: String!
  password: String!
  token: String!
}

type Query {
  accountById(id: String): Account
  accounts: [Account]
}

input CreateAccount {
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

type Mutation {
  createAccount(input: CreateAccountInput!): Account
  updateAccountName(input: UpdateAccountNameInput!): Account
  updateAccountAge(input: UpdateAccountAgeInput!): Account
  removeAccount(id: Int!): Account
}
  `,
    config: {
      entities: {
        Account: {
          stateMachine: {
            initial: "empty",
            states: {
              empty: {
                on: {
                  create: "created",
                },
              },
              created: {
                on: {
                  updateName: "updatedName",
                  updatePassword: "updatedPassword",
                  remove: "empty",
                },
              },
              updatedName: {
                on: {
                  updatePassword: "updatedPassword",
                  remove: "empty",
                },
              },
              updatedPassword: {
                on: {
                  updateName: "updatedName",
                  remove: "empty",
                },
              },
            },
          },
          instances: {
            John: {
              statesData: {
                created: {
                  id: "1",
                  name: "John Doe",
                  email: "john@mail.com",
                  password: "johnPass",
                },
                updatedName: {
                  id: "1",
                  name: "John Duck",
                  email: "john@mail.com",
                  password: "johnPass",
                },
                updatedPassword: {
                  id: "1",
                  name: "John Doe",
                  email: "john@mail.com",
                  password: "johnNewPass",
                },
              },
            },
            Mark: {
              statesData: {
                created: {
                  id: "2",
                  name: "Mark Swain",
                  email: "markh@mail.com",
                  password: "markPass",
                },
                updatedName: {
                  id: "2",
                  name: "Mark Louis",
                  email: "markh@mail.com",
                  password: "markPass",
                },
                updatedPassword: {
                  id: "2",
                  name: "Mark Swain",
                  email: "markh@mail.com",
                  password: "markNewPass",
                },
              },
            },
          },
        },
      },
      requests: [
        {
          body: '{"query":"query Query {\\r\\n  accountById {\\r\\n    id\\r\\n    name\\r\\n    email\\r\\n    password\\r\\n  }\\r\\n \\r\\n}","variables":{},"operationName":"Query"}',
          response: {
            entity: "Account",
            id: "John",
          },
        },
        {
          body: '{"query":"query Query {\\r\\n  accounts {\\r\\n    id\\r\\n    name\\r\\n    email\\r\\n    password\\r\\n  }\\r\\n}","variables":{},"operationName":"Query"}',
          response: [
            {
              entity: "Account",
              id: "John",
            },
            {
              entity: "Account",
              id: "Mark",
            },
          ],
        },
        {
          body: '{"query":"mutation Mutation($input: CreateAccountInput!) {\\r\\n  createAccount(input: $input) {\\r\\n    id\\r\\n    name\\r\\n    email\\r\\n    password\\r\\n  }\\r\\n}","variables":{"input":{"name":"John","email":"john@mail.com","password":"johnPass"}},"operationName":"Mutation"}',
          response: {
            entity: "Account",
            id: "John",
            state: "created",
          },
          stateChanges: [
            {
              entity: "Account",
              id: "John",
              event: "create",
            },
          ],
        },
        {
          body: '{"query":"mutation Mutation($input: CreateAccountInput!) {\\r\\n  createAccount(input: $input) {\\r\\n    id\\r\\n    name\\r\\n    email\\r\\n    password\\r\\n  }\\r\\n}","variables":{"input":{"name":"Mark","email":"mark@mail.com","password":"markPass"}},"operationName":"Mutation"}',
          response: {
            entity: "Account",
            id: "Mark",
            state: "created",
          },
          stateChanges: [
            {
              entity: "Account",
              id: "Mark",
              event: "create",
            },
          ],
        },
        {
          body: '{"query":"mutation UpdateAccountName($input: UpdateAccountNameInput!) {\\r\\n  updateAccountName(input: $input) {\\r\\n    id\\r\\n    name\\r\\n    email\\r\\n    password\\r\\n  }\\r\\n}","variables":{"input":{"id":"2","name":"Mark"}},"operationName":"UpdateAccountName"}',
          response: {
            entity: "Account",
            id: "Mark",
            state: "updatedName",
          },
          stateChanges: [
            {
              entity: "Account",
              id: "Mark",
              event: "updateName",
            },
          ],
        },
        {
          body: '{"query":"mutation UpdateAccountName($input: UpdateAccountNameInput!) {\\r\\n  updateAccountName(input: $input) {\\r\\n    id\\r\\n    name\\r\\n    email\\r\\n    password\\r\\n  }\\r\\n}","variables":{"input":{"id":"1","name":"John"}},"operationName":"UpdateAccountName"}',
          response: {
            entity: "Account",
            id: "John",
            state: "updatedName",
          },
          stateChanges: [
            {
              entity: "Account",
              id: "John",
              event: "updateName",
            },
          ],
        },
        {
          body: '{"query":"mutation Mutation($input: UpdateAccountPasswordInput!) {\\r\\n  updateAccountPassword(input: $input) {\\r\\n    id\\r\\n    name\\r\\n    email\\r\\n    password\\r\\n  }\\r\\n}","variables":{"input":{"id":"1","password":"newJohnPassword"}},"operationName":"Mutation"}',
          response: {
            entity: "Account",
            id: "John",
            state: "updatedPassword",
          },
          stateChanges: [
            {
              entity: "Account",
              id: "John",
              event: "updatePassword",
            },
          ],
        },
        {
          body: '{"query":"mutation Mutation($input: UpdateAccountPasswordInput!) {\\r\\n  updateAccountPassword(input: $input) {\\r\\n    id\\r\\n    name\\r\\n    email\\r\\n    password\\r\\n  }\\r\\n}","variables":{"input":{"id":"2","password":"newMarkPassword"}},"operationName":"Mutation"}',
          response: {
            entity: "Account",
            id: "Mark",
            state: "updatedPassword",
          },
          stateChanges: [
            {
              entity: "Account",
              id: "Mark",
              event: "updatePassword",
            },
          ],
        },
        {
          body: '{"query":" \\r\\n\\r\\nmutation RemoveAccount($removeAccountId: String!) {\\r\\n  removeAccount(id: $removeAccountId) {\\r\\n    id\\r\\n    name\\r\\n    email\\r\\n    password\\r\\n  }\\r\\n}","variables":{"removeAccountId":"1"},"operationName":"RemoveAccount"}',
          response: {
            entity: "Account",
            id: "John",
            state: "empty",
          },
          stateChanges: [
            {
              entity: "Account",
              id: "John",
              event: "remove",
            },
          ],
        },
        {
          body: '{"query":" \\r\\n\\r\\nmutation RemoveAccount($removeAccountId: String!) {\\r\\n  removeAccount(id: $removeAccountId) {\\r\\n    id\\r\\n    name\\r\\n    email\\r\\n    password\\r\\n  }\\r\\n}","variables":{"removeAccountId":"2"},"operationName":"RemoveAccount"}',
          response: {
            entity: "Account",
            id: "Mark",
            state: "empty",
          },
          stateChanges: [
            {
              entity: "Account",
              id: "Mark",
              event: "remove",
            },
          ],
        },
      ],
    },
  },
};

exports.CONFIG_FILE_PATH = "mocks/config.json";
exports.SCHEMA_FILE_PATH = "mocks/schema.graphql";
exports.PORT = 4000;
