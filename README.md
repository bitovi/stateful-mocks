# stateful-mocks

## Usage

### Stateful Mock Server

Coming soon!

### Mock Data Generator

```
$ npm i @bitovi/stateful-mocks

$ npx sms --help
Usage: gen [options]

CLI for the stateful mocks server(sms)

Options:
  -V, --version   output the version number
  -h, --help      display help for command

Commands:
  gen [options]   CLI to generate mock data for an entity
                  of a GraphQL schema
  run [options]   CLI to run mock server
  help [command]  display help for command
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
