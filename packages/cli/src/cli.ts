import yargs, { Arguments } from 'yargs';
import { dirname, resolve, isAbsolute } from 'path';
import pkg from 'pkg-up';
import { readJson, existsSync, pathExists } from 'fs-extra';
import { scanAll } from './blueprints';
import { assemble } from './commands';

export async function getProjectRoot() {
  return resolve(dirname(await pkg(process.cwd())));
}

export async function findBlueprintLocations(root: string) {
  let locations = [resolve(root, 'blueprints')];
  const packagePath = resolve(root, 'package.json');

  if ((await pathExists(packagePath)) === true) {
    const json = await readJson(packagePath);

    if (json.bluprint && json.bluprint.locations) {
      locations = [
        ...locations,
        ...json.bluprint.locations.map((location: string) =>
          isAbsolute(location) ? location : resolve(root, location),
        ),
      ];
    }
  }

  return locations.filter(location => existsSync(location));
}

export async function createYargs(root: string) {
  const locations = await findBlueprintLocations(root);
  const blueprints = await scanAll(locations);

  let argv = yargs
    .reset()
    .strict()
    .locale('en')
    .command(assemble(root, blueprints))
    .wrap(yargs.terminalWidth())
    .demandCommand(1);

  return argv;
}

export async function run(
  root: string,
  input: string[] | string,
): Promise<string> {
  const argv = await createYargs(root);

  return new Promise((resolve, reject) => {
    argv
      .fail(() => {})
      .parse(
        input,
        (error: Error | undefined, args: Arguments, output: string) => {
          // this is a hack
          // since yargs parse does not wait for the async command to complete,
          // we store the promise on the args object inside async commands to wait for it here.
          if ((args as any).promise) {
            (args as any).promise
              .then(() => resolve(output))
              .catch(() => resolve(output));
          } else {
            resolve(output);
          }
        },
      );
  });
}
