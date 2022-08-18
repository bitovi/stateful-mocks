# stateful-mocks

This library is designed to simulate a GraphQL (and Restful in the future) server and generate stateful mocks
for your resolvers based in your schema.graphql. Through a custom file called config.json you can describe
exactly what state mutations should happen when you make a request and what data those states represent.

## Usage

In a node project already containing your schema.graphql, run:

```
npm install @bitovi/stateful-mocks
npx @bitovi/stateful-mocks -s schema.graphql -p 3000
```

### Stateful Mock Server

Coming soon!

## Releasing a new version

1. Make sure you are on the `main` branch and have the latest code

```
git checkout main
git pull
```

2. Run the release script for the version you would like to create.

```
npm run release:patch
```

That's it, the CI/CD workflow will do the rest.
