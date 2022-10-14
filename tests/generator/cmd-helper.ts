import concat from "concat-stream";
import { spawn } from "cross-spawn";

const createProcess = (
  command: string,
  args: Array<string> = [],
  options: Record<string, unknown>
) => {
  return spawn(command, [args], options);
};

export const executeWithInput = (
  command: string,
  args: Array<string> = [],
  inputs: Array<string> = [],
  options: Record<string, unknown>
) => {
  const timeout = 1000;
  const childProcess = createProcess(command, args, options);

  childProcess.stdin.setDefaultEncoding("utf-8");

  let currentInputTimeout;

  const loop = (inputs) => {
    if (!inputs.length) {
      childProcess.stdin.end();
      return;
    }

    currentInputTimeout = setTimeout(() => {
      childProcess.stdin.write(inputs[0]);
      loop(inputs.slice(1));
    }, timeout);
  };
  const promise = new Promise((resolve, reject) => {
    childProcess.stderr.once("data", (err, data) => {
      childProcess.stdin.end();

      if (currentInputTimeout) {
        clearTimeout(currentInputTimeout);
        inputs = [];
      }

      reject(err.toString());
    });

    childProcess.on("error", reject);
    loop(inputs);
    childProcess.stdout.pipe(
      concat((result) => {
        resolve(result.toString());
      })
    );
  });
  return promise;
};

export const directionsUnicode = {
  DOWN: "\x1B\x5B\x42",
  UP: "\x1B\x5B\x41",
  ENTER: "\x0D",
  SPACE: "\x20",
};
