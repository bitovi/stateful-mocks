import type { Config, RequestSpecifications } from "../../interfaces/graphql";
import type { GraphQLSchema } from "graphql";
import { parse } from "graphql";
import { readFile } from "../io";

export const getSchemaFile = async (schemaFilePath: string) => {
  const schema = await readFile(schemaFilePath);
  return schema as unknown as GraphQLSchema;
};

export const getConfig = async (configFilePath: string): Promise<Config> => {
  const config = await readFile(configFilePath);

  return JSON.parse(config);
};

export const getSupportedRequests = async (schemaFilePath: string) => {
  const typeDefs = await getSchemaFile(schemaFilePath);
  const supportedRequests = parse(String(typeDefs))
    .definitions.map((definition: any) => {
      const { value } = definition.name;

      if (value === "Query" || value === "Mutation") {
        return definition.fields.map((field) => ({
          name: field.name.value,
          type: value,
        }));
      }
    })
    .filter((element) => Boolean(element));

  return [].concat.apply([], supportedRequests);
};

export const isSupportedRequest = async (
  requestName: string,
  schemaFilePath: string
) => {
  const supportedRequests: RequestSpecifications[] = await getSupportedRequests(
    schemaFilePath
  );

  return supportedRequests.some((request) => request.name === requestName);
};
