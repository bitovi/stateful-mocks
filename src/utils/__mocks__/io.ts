import fs from "fs";
const fsPromises = fs.promises;

const __jestMockFilesystem = new Map<string, string>();

export const createDirectory = (path: string) => {
  return true;
};

export const existsDirectory = (path: string) => {
  return __jestMockFilesystem.has(path);
};

export const writeFile = async (
  path: string,
  content: string
): Promise<void> => {
  __jestMockFilesystem.set(path, content);
  return Promise.resolve();
};

export const readFile = async (path: string) => {
  let result = __jestMockFilesystem.get(path);
  if (!result) {
    result = await fsPromises.readFile(path, "utf8");
  }
  if (!result) {
    throw new Error("Unknown Virtual File: " + path);
  }

  return result;
};

// No-op
export const watchConfigFile = (_path: string, _cb: any) => {};
