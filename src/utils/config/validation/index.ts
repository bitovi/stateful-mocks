import Ajv from "ajv";
import fs from "fs";
const fsPromises = fs.promises;
import { InvalidConfig } from "../../../errors/invalidConfig";
import { writeNewConfig } from "../../config";
import { createDirectory, existsDirectory } from "../../io";
import { schema } from "./schemas";

const ajv = new Ajv({ strictTuples: false, strictTypes: false });
export const validate = ajv.compile(schema);

export const ensureConfigFileExists = async (
  configFilePath: string
): Promise<void> => {
  const absolutePath = `${process.cwd()}/${configFilePath}`;
  const isValidPath = existsDirectory(absolutePath);

  if (!isValidPath) {
    ensureFileDirectoryExits(configFilePath);
    const config = {
      entities: {},
      requests: [],
    };
    await writeNewConfig(config, configFilePath);
  }
};

const ensureFileDirectoryExits = (filePath: string) => {
  if (filePath.includes("/")) {
    const directoriesPath = filePath.substr(0, filePath.lastIndexOf("/"));
    createDirectory(directoriesPath);
  }
};

export const validateConfigFileFormat = async (
  configFilePath: string,
  isNotValidBehavior
) => {
  let config = await fsPromises.readFile(configFilePath, "utf8");

  config = JSON.parse(config);

  const valid = validate(config);

  if (!valid) {
    isNotValidBehavior();
  }
};

export const validateConfigFile = async (configFilePath: string) => {
  await ensureConfigFileExists(configFilePath);
  await validateConfigFileFormat(configFilePath, () => {
    throw new InvalidConfig();
  });
};
