import fs from 'fs';
import { parse } from 'graphql';
import { Config, RequestSpecifications } from '../../interfaces/graphql';

export const getFile = (schemaFilePath: string): string => {
  return fs.readFileSync(
    `${process.cwd()}/${schemaFilePath}`,
    'utf8'
  ) as unknown as string;
};

export const getConfig = (configFilePath: string): Config => {
  const config = getFile(configFilePath);

  return JSON.parse(config);
};

export const getSupportedRequests = (
  schemaFilePath: string
): Array<RequestSpecifications> => {
  const typeDefs = getFile(schemaFilePath);
  const supportedRequests = parse(String(typeDefs))
    .definitions.map((definition: any) => {
      const { value } = definition.name;

      if (value === 'Query' || value === 'Mutation') {
        return definition.fields.map((field) => ({
          name: field.name.value,
          type: value,
        }));
      }
    })
    .filter((element) => Boolean(element));

  return [].concat.apply([], supportedRequests);
};
