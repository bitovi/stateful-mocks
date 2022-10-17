import fs from "fs";
import { validateConfigFileFormat } from "./config/validation";
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

export const watchConfigFile = (path: string, cb: any) => {
  const watcher = fs.watch(path, cb);

  watcher.on("error", function (err) {
    if (existsDirectory(path)) {
      watcher.close();
    }
  });
};

export const addScriptToPackageJson = async (
  configPath: string,
  schemaPath: string,
  port: number
) => {
  const pkgPath = process.cwd() + "/package.json";
  const pkgString = await readFile(pkgPath);
  const pkg = JSON.parse(pkgString);
  Object.assign(pkg.scripts ?? {}, {
    sms: `sms -c ${configPath} -s ${schemaPath} -p ${port}`,
  });

  writeFile(pkgPath, JSON.stringify(pkg, null, "\t"));
};
