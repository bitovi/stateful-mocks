import fs from "fs";
import { GraphQLSchema } from "graphql";
import { parse } from "graphql";
import { Config, RequestSpecifications } from "../../interfaces/graphql";
import { readFile } from "../io";

export const getSchemaFile = (schemaFilePath: string): GraphQLSchema => {
  return fs.readFileSync(
    `${process.cwd()}/${schemaFilePath}`,
    "utf8"
  ) as unknown as GraphQLSchema;
};

export const getConfig = (configFilePath: string): Config => {
  const config = readFile(configFilePath);

  return JSON.parse(config);
};
export const getSupportedRequests = (
  schemaFilePath: string
): Array<RequestSpecifications> => {
  const typeDefs = getSchemaFile(schemaFilePath);
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

export const isSupportedRequest = (
  requestName: string,
  schemaFilePath: string
): boolean => {
  const supportedRequests: Array<RequestSpecifications> =
    getSupportedRequests(schemaFilePath);

  return supportedRequests.some((request) => request.name === requestName);
};
