import fs from "fs";
const fsPromises = fs.promises;

export const createDirectory = (path) => {
  return fs.mkdirSync(path, { recursive: true });
};

export const existsDirectory = (path) => {
  return fs.existsSync(path);
};

export const writeFile = async (content, path): Promise<void> => {
  return fsPromises.writeFile(path, content);
};

export const readFile = (path: string): string => {
  return fs.readFileSync(path, "utf8") as unknown as string;
};
