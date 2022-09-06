---
outline: deep
---

# Getting Started

You can [use the generator](#use-the-generator) to add Stateful Mock Server to your existing node project. Whether you have your own schema, or you want to get started with an example schema and config, the process to get started is similar.

If you prefer, you can also get [manually install Stateful Mock Server](#manual-installation).

## Use the Generator

Run a single command to get up and running right away:

```bash
npx @bitovi/stateful-mocks init
```

The generator will ask you for the following information:

- Where to create the config file
- Where to create the GraphQL schema file
- Which port to use for the server, default `4000`.
- What starting config to use, which will be one of the following options
  - Empty, a minimal config and schema
  - User Admin

The folders and files needed to generate the schema and config will be automatically created for you.

### Use Your Own Schema

Use the Quick Start steps above and choose the "Empty" starting config. Once you've run the generator, paste your GraphQL schema into the generated `schema.graphql`.

### Use an Example Schema

Use the Quick Start steps above and choose an example starting config.

## Manual Installation

It's possible to manually add Stateful Mock Server to your project. Perform the following steps:

### Install Stateful Mocks

```bash
npm i @bitovi/stateful-mocks -D
```

### Create a `config.json` file.

```bash
mkdir ./mocks;
touch ./mocks/config.json
echo "{ \n\t\"entities\": {}, \n\t\"requests\": [] \n}" > "./mocks/config.json"
```

### Add your GraphQL schema.

You'll need a valid GraphQL schema for this step. If you don't have one, create one using the [quick start generator](#use-the-generator).

```bash
touch ./mocks/schema.graphql
```

Paste or enter your schema into the newly-created file.

### Add the `sms` script to `package.json`.

```json
"scripts": {
  "sms": "sms -c mocks/config.json -s mocks/schema.graphql -p 4000"
}
```

You can now use the command `npm run sms` to run your local Stateful Mocks Server.

## Run Stateful Mock Server

If you ran the generator, you will have an npm script in your package.json called `sms`. Run the server with the following command:

```bash
npm run sms
```

If you didn't run the generator, you can run Stateful Mock Server with the following command:

```bash
npm run sms -c path/to/config.json -s path/to/schema.graphql [-p PORT]
```

The server will start after validating your schema and config file.
