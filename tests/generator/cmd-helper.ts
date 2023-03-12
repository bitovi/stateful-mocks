import { spawn } from "cross-spawn";

export const execute = async (command, args, temporaryDirectoryName) => {
  const child = spawn(command, [args], {
    shell: true,
    cwd: temporaryDirectoryName,
  });

  let data = "";
  for await (const chunk of child.stdout) {
    data += chunk;
  }

  await new Promise((resolve, reject) => {
    child.on("close", resolve);
  });

  return data;
};

export const executeWithInput = async (
  command,
  args: string,
  inputs: Array<string> = [],
  options: Record<string, unknown>
) => {
  const timeout = 1000;

  const child = spawn(command, [args], options);

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
