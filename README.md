# stateful-mocks

Stateful Mock Server upgrades GraphQL's built-in mocks to be truly useful. With XState under the hood, you can
simulate custom logic. State machines combined with in-memory data storage make your mocks feel more like real services.

- Produce higher-fidelity, frontend prototypes.
- Begin writing integration tests before the backend is complete.

Once you've reached consensus on your GraphQL schema, plug it into Stateful Mock Server.

This library is designed to simulate a GraphQL (and Restful in the future) server and generate stateful mocks
for your resolvers based in your schema.graphql. Through a custom file called `config.json` you can describe
exactly what state mutations should happen when you make a request and what data those states represent.

## Usage

In a node project already containing your `schema.graphql`, run:

```bash
npm install @bitovi/stateful-mocks
npx @bitovi/stateful-mocks -s schema.graphql -p 3000
```

### Stateful Mock Server

Coming soon!

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
