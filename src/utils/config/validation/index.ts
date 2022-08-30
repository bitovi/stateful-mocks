import Ajv from "ajv";
import { InvalidConfig } from "../../../errors/invalidConfig";
import { ServerError } from "../../../errors/serverError";
import {
  createDirectory,
  existsDirectory,
  readFile,
  writeFile,
} from "../../io";
import { schema } from "./schemas";
import path from "path";

const ajv = new Ajv({ strictTuples: false, strictTypes: false });
export const validate = ajv.compile(schema);

export const ensureFileExists = async (
  filePath: string,
  content: string
): Promise<void> => {
  const absolutePath = path.resolve(`${process.cwd()}/${filePath}`);
  const isValidPath = existsDirectory(absolutePath);

  if (!isValidPath) {
    ensureFileDirectoryExits(filePath);
    await writeFile(filePath, content);
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
  try {
    let config = await readFile(configFilePath);

    if (config) {
      config = JSON.parse(config);

      const valid = validate(config);

      if (!valid) {
        isNotValidBehavior();
      }
    }
  } catch (error: unknown) {
    throw new ServerError();
  }
};

export const validateConfigFile = async (configFilePath: string) => {
  const config = { entities: {}, requests: [] };
  await ensureFileExists(configFilePath, JSON.stringify(config, null, "\t"));
  await validateConfigFileFormat(configFilePath, () => {
    throw new InvalidConfig();
  });
};
