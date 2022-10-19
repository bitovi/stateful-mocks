# Customize the Configuration

There is no setup needed to use a custom schema with Stateful Mocks. You’ll only need to copy and paste it into your project, and correctly pass its path as an argument to Stateful Mocks' CLI.

## Custom Configuration File

All your state transition rules are defined in your Stateful Mock’s configuration file (by default it is called config.json, but you may call it whatever you want), and they are applied using XState under the hood.

Here’s an example `config.json`:

```json
{
    "entities": {
        "Account": {
            "stateMachine": {
                "initial": "created",
                "states": {
                    "empty": {
                        "on": {
                            "create": "created"
                        }
                    },
                    "created": {
                        "on": { 
       "updateName": "updatedName",
                            "remove": "empty"
                        }
                    },
                    "updatedName": {
                        "on": {  
                            "remove": "empty"
                        }
                    }
                }
            },
            "instances": {
                "John": {
                    "statesData": {
                        "created": {
                            "id": 1,
                            "name": "John Doe",
                            "email": "john@mail.com",
                            "password": "johnPass",
                            "token": "voluptas"
                        }
                    }
                }
        }
    },
    "requests": [
        {
            "body": "{\"query\":\"query Query($accountByIdId: Int) {\\r\\n  accountById(id: $accountByIdId) {\\r\\n    id\\r\\n    name\\r\\n    email\\r\\n    password\\r\\n    token\\r\\n  }\\r\\n}\",\"variables\":{\"accountByIdId\":1},\"operationName\":\"Query\"}",
            "response": {
                "entity": "Account",
                "id": "John"
            }
        }, 
  {
   "body": "{\"query\":\"mutation Mutation($input: CreateAccountInput!) {\\r\\n  createAccount(input: $input) {\\r\\n    id\\r\\n    name\\r\\n    email\\r\\n    password\\r\\n    token\\r\\n  }\\r\\n}\",\"variables\":{\"input\":{\"name\":\"John Doe\",\"email\":\"john@mail.com\",\"password\":\"johnPass\"}},\"operationName\":\"Mutation\"}",
   "response": {
    "entity": "Account",
    "id": "John",
    "state": "created"
   },
   "stateChanges": [
    {
     "entity": "Account",
     "id": "John",
     "event": "create"
    }
   ]
  },
    ]
}
```

The configuration file is divided in two main parts: the entities and the requests.

## Entities

The entities property is an object with a key for each one of the GraphQL types that can be returned from a request. Each entity will have its own state machine property containing its state transition rules and also a list of instances of mocked data.

- **stateMachine:**
  - **initial:** you can use this property to define what the initial state will be for your instances.
  - **states:** you can use this property to define what state transitions are allowed. In the above example, it is possible to transition from `empty` to `created`, but not from `empty` to `updatedName`. It's also possible to transition from created to `updatedName` and `empty`, but it's not possible to transition from `updatedName` to `created`.
- **instances:** by default, whenever a new request is made we’ll generate mock data that matches the required fields and save it in the first instance of an entity (or in the first two if your request returns an array). You may modify it if you want your data to look different.  Just be sure your changes don't conflict with your GraphQL schema:

```json
 "updatedName": {
   "id": 1,
   "name": "John Doe",
   "email": "john@mail.com",
   "password": "johnPass",
   "token": "voluptas"
}
```

You can remove and edit fields from this example state, but you can’t change the name field from a String into a Number without updating your GraphQL schema and restarting the server. Your fields must always match the type defined in your GraphQL schema.

## Requests

The `requests` property is an array that stores information about each request. Whenever you make a request (whether it’s a mutation or a query) that has an unique combination of type and variables, it will be saved in the request’s array. It will also generate a new state in your entity’s state machine’s states and mock data for that state in your first entity’s instance.

- **body:** a stringified version of your GraphQL request.
- **response:** this can be an array, if you want to return multiple instances, or an object, if you want to return just one.
  - **entity:** the GraphQL type to be returned.
  - **id:** must match a key in the instance’s of the entity object.
  - **state:** the state’s data to be returned. If this property is not present in your response or if the state doesn’t match a key of the instance’s stateData object, Stateful Mocks will return the current state, by default. If this property is present, the current state will be ignored and Stateful Mocks will try to return this stateData.
- **stateChanges:** if this property is present, Stateful Mocks will try to transition the instance from the current state into the one specified.
  - **entity:** the GraphQL type to be returned.
  - **id:** must match a key in the instance’s of the entity object.
  - **event:** the state transition that must be performed in the instance specified.
