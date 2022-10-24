# stateful-mocks

Stateful Mock Server upgrades GraphQL's built-in mocks to be truly useful. With XState under the hood, you can
simulate custom logic. State machines combined with in-memory data storage make your mocks feel more like real services.

- Produce higher-fidelity, frontend prototypes.
- Begin writing integration tests before the backend is complete.

Once you've reached consensus on your GraphQL schema, plug it into Stateful Mock Server.

This library is designed to simulate a GraphQL (and Restful in the future) server and generate stateful mocks
for your resolvers based in your schema.graphql. Through a custom file called `config.json` you can describe
exactly what state mutations should happen when you make a request and what data those states represent.

## Quick Start

Use the generator to add Stateful Mock Server to your existing node project. Whether you have your own schema, or you want to get started with an example schema and config, the process to get started is similar.

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

### Start With Your Own Schema

Use the Quick Start steps above and choose the "Empty" starting config. Once you've run the generator, paste your GraphQL schema into the generated `schema.graphql`.

### Start With an Example Schema and Config

Use the Quick Start steps above and choose an example starting config.

### Run Stateful Mock Server

If you ran the generator, you will have an npm script in your package.json called `sms`. Run the server with the following command:

```bash
npm run sms
```

If you didn't run the generator, you can run Stateful Mock Server with the following command:

```bash
npm run sms -c path/to/config.json -s path/to/schema.graphql [-p PORT]
```

The server will start after validating your schema and config file.

## Releasing a new version

1. Make sure you are on the `main` branch and have the latest code

   ```bash
   git checkout main
   git pull
   ```

2. Run the release script for the version you would like to create.

   ```bash
   npm run release:patch
   ```

That's it, the CI/CD workflow will do the rest.

# We want to hear from you.

Come chat with us about open source in our community [Slack](https://www.bitovi.com/community/slack).

See what we're up to by following us on [Twitter](https://twitter.com/bitovi).
