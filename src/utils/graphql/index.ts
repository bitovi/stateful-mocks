import fs from 'fs';
import { Config } from '../../interfaces/graphql';

import { CONFIG_FILE_PATH, SCHEMA_FILE_PATH } from './constants';

export const getTypeDefs = (): string => {
  return fs.readFileSync(SCHEMA_FILE_PATH, 'utf8') as unknown as string;
};

export const getConfig = (): Config => {
  return require(CONFIG_FILE_PATH) as unknown as Config;
};
