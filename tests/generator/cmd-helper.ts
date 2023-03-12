import { spawn } from "cross-spawn";

export const execute = async (command, temporaryDirectoryName) => {
  const child = spawn("npm", [command], {
    shell: true,
    cwd: temporaryDirectoryName,
  });

  await new Promise((resolve) => {
    child.on("close", resolve);
  });
};

export const executeWithInput = async (
  args: string,
  inputs: Array<string> = [],
  options: Record<string, unknown>
) => {
  const timeout = 1000;

  const child = spawn("npx", [args], options);

  child.stdin.setDefaultEncoding("utf-8");

  let currentInputTimeout;

  const loop = (inputs) => {
    if (!inputs.length) {
      child.stdin.end();
      return;
    }

    currentInputTimeout = setTimeout(() => {
      child.stdin.write(inputs[0]);
      loop(inputs.slice(1));
    }, timeout);
  };

  loop(inputs);

  await new Promise((resolve, reject) => {
    child.stderr.once("data", (err, data) => {
      child.stdin.end();

      if (currentInputTimeout) {
        clearTimeout(currentInputTimeout);
        inputs = [];
      }

      reject(err.toString());
    });

    child.on("error", reject);

    child.on("close", resolve);
  });
};

export const directionsUnicode = {
  DOWN: "\x1B\x5B\x42",
  UP: "\x1B\x5B\x41",
  ENTER: "\x0D",
  SPACE: "\x20",
};
