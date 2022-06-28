# stateful-mocks

## Usage

### Stateful Mock Server

Coming soon!

### Mock Data Generator

```
$ node bin/sms-gen.js --help
Usage: sms-gen [options]

CLI to generate mock data for an entity of a GraphQL schema

Options:
  -V, --version      output the version number
  --schema <path>    path to GraphQL schema
  --entity <name>    Entity to generate mock data for
  --fields <fields>  Comma-separated list of fields to mock
  -h, --help         display help for command
```

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
