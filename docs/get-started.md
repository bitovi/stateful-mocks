---
outline: deep
---

# Getting Started

You can [use the generator](#use-the-generator) to add Stateful Mock Server to your existing node project. Whether you have your own schema, or you want to get started with an example schema and config, the process to get started is similar.

If you prefer, you can also get [manually install Stateful Mock Server](#manual-installation).

## Use the Generator

```bash
npx @bitovi/stateful-mocks init
```

The generator will ask you a few questions:

- Config file path
- GraphQL schema file path
- Starting config, which can be one of the following options
  - Empty, a minimal config and schema
  - User Admin

The folders and files needed to generate the schema and config will be automatically created for you.

### Use Your Own Schema

Use the Quick Start steps above and choose the "Empty" starting config. Once you've run the generator, paste your GraphQL schema into the generated `schema.graphql`.

### Use an Example Schema

Use the Quick Start steps above and choose an example starting config.

## Manual Installation

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
