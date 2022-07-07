import fs from "fs";
import { parse } from "graphql";
import { Config } from "../../interfaces/graphql";

import { CONFIG_FILE_PATH, SCHEMA_FILE_PATH } from "./constants";

export const getTypeDefs = (): string => {
  return fs.readFileSync(SCHEMA_FILE_PATH, "utf8") as unknown as string;
};

export const getConfig = (): Config => {
  return require(CONFIG_FILE_PATH) as unknown as Config;
};

export const getSupportedRequests = () => {
  const typeDefs = getTypeDefs();
  const supportedRequests = parse(String(typeDefs))
    .definitions.map((definition: any) => {
      if (
        definition.name.value === "Query" ||
        definition.name.value === "Mutation"
      ) {
        return definition.fields.map((field) => field.name.value);
      }
    })
    .filter((element) => Boolean(element));

  return [].concat.apply([], supportedRequests);
};
