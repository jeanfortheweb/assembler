import temp from 'temp';
import { join } from 'path';
import { writeJsonSync } from 'fs-extra';
import { Argv, Arguments } from 'yargs';

temp.track();

export async function createPackage(data: any): Promise<string> {
  return new Promise((resolve, reject) => {
    temp.mkdir(undefined, (err, path) => {
      if (err) {
        return reject();
      }

      try {
        writeJsonSync(join(path, 'package.json'), data, { spaces: 2 });
        resolve(path);
      } catch (error) {
        reject(error);
      }
    });
  });
}

export async function executeYargs(
  yargs: Argv,
  input: string,
): Promise<{ argv: Arguments; output: string }> {
  return await new Promise((resolve, reject) => {
    yargs
      .exitProcess(false)
      .parse(
        input,
        (err: Error | undefined, argv: Arguments, output: string) => {
          if (err) {
            reject(err);
          } else {
            resolve({ argv, output });
          }
        },
      );
  });
}

export async function expectYargsOutput(
  yargs: Argv,
  input: string,
  ...expectations: Array<string | RegExp>
) {
  const { output } = await executeYargs(yargs, input);

  for (let expectiation of expectations) {
    expect(output).toMatch(expectiation);
  }
}
