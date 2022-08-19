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

export const readFile = (path: string): string => {
  const result = __jestMockFilesystem.get(path);
  if (!result) {
    throw new Error("Unknown Virtual File: " + path);
  }

  return result;
};
