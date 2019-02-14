import yargs, { Arguments } from 'yargs';
import { dirname, resolve, isAbsolute } from 'path';
import pkg from 'pkg-up';
import { readJson, existsSync, pathExists } from 'fs-extra';
import { create as createStore } from 'mem-fs';
import { create as createEditor } from 'mem-fs-editor';
import { Blueprint, Blueprints, scanAll, execute } from './blueprints';
import { createEnvironment } from './environment';

export async function getProjectRoot() {
  return resolve(dirname(await pkg(process.cwd())));
}

export async function findBlueprintLocations(root: string) {
  let locations = [resolve(root, 'blueprints')];
  const packagePath = resolve(root, 'package.json');

  if ((await pathExists(packagePath)) === true) {
    const json = await readJson(packagePath);

    if (json.assembler && json.assembler.blueprints) {
      locations = [
        ...locations,
        ...json.assembler.blueprints.map((location: string) =>
          isAbsolute(location) ? location : resolve(root, location),
        ),
      ];
    }
  }

  return locations.filter(location => existsSync(location));
}

export function createCommand(
  yargs: yargs.Argv,
  name: string,
  blueprint: Blueprint,
): yargs.Argv {
  return yargs.command(
    blueprint.arguments ? `${name} ${blueprint.arguments}` : name,
    blueprint.description,
    blueprint.configure,
  );
}

export async function createYargs(blueprints: Blueprints) {
  let argv = yargs
    .reset()
    .strict()
    .locale('en')
    .usage('$0 <command>')
    .demandCommand(1, 'You have to pass a blueprint name');

  for (let [name, blueprint] of Object.entries(blueprints)) {
    argv = createCommand(argv, name, blueprint);
  }

  return argv;
}

export async function run(
  root: string,
  input: string[] | string,
): Promise<string> {
  const locations = await findBlueprintLocations(root);

  if (locations.length === 0) {
    throw new Error('Found no blueprint locations.');
  }

  const blueprints = await scanAll(locations);
  const argv = await createYargs(blueprints);

  return new Promise((resolve, reject) => {
    argv.parse(
      input,
      (err: Error | undefined, args: Arguments, output: string) => {
        if (!err) {
          const blueprint = blueprints[args._[0] as string];
          const memfs = createEditor(createStore());
          const env = createEnvironment(dirname(blueprint.path), root);
          execute(blueprint, args, memfs, env)
            .then(() => resolve(output))
            .catch(reject);
        } else {
          reject(err);
        }
      },
    );
  });
}
