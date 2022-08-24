import fs from "fs";
const fsPromises = fs.promises;

export const createDirectory = (path) => {
  return fs.mkdirSync(path, { recursive: true });
};

export const existsDirectory = (path) => {
  return fs.existsSync(path);
};

export const writeFile = async (path, content): Promise<void> => {
  return fsPromises.writeFile(path, content);
};

export const readFile = async (path: string) => {
  return await fsPromises.readFile(path, "utf8");
};

export const watch = (path: string, cb: any) => {
  fs.watch(path, "utf-8", cb);
};
