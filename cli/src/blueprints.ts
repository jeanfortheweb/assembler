import yargs, { Argv } from 'yargs';
import Listr from 'listr';
import { dirname, basename } from 'path';
import glob from 'glob';
import { TaskCreator, Blueprint } from './blueprints';
import { Environment } from './environment';
import { Task, normalizeTasks } from './tasks';

//@ts-ignore
import UpdateRenderer = require('listr-update-renderer');
import { Editor } from 'mem-fs-editor';

export interface TaskCreator<T> {
  (args: T, environment: Environment): Task;
}

export type Options = {
  [key: string]: yargs.Options;
};

/**
 * Blueprint.
 */
export interface Blueprint<T = any> {
  description: string;
  arguments?: string;
  configure?: (argv: Argv<T>) => Argv<T>;
  create: TaskCreator<T>;
}

export interface LoadedBlueprint extends Blueprint {
  path: string;
}

export type Blueprints<T extends Blueprint = Blueprint> = {
  [key: string]: T;
};

/**
 * Validates a blueprint
 *
 * @param blueprint Blueprint to validate
 */
export function validate(blueprint: any): LoadedBlueprint {
  const checks: [(blueprint: LoadedBlueprint) => boolean, string][] = [
    [
      blueprint => typeof blueprint !== 'object',
      'Blueprint should export a blueprint object as default.',
    ],
    [
      blueprint => typeof blueprint.path !== 'string',
      'Blueprint should have a path set.',
    ],
    [
      blueprint => typeof blueprint.description !== 'string',
      'Blueprint is missing a description.',
    ],
    [
      blueprint => typeof blueprint.create !== 'function',
      'Blueprint is missing a create function.',
    ],
  ];

  const error = checks.find(([check]) => check(blueprint) === true);

  if (error) {
    throw new Error(error[1] as string);
  }

  return blueprint;
}

/**
 * Loads a blueprint from a file, validates and returns it.
 *
 * @param path Path to blueprint file.
 */
export async function load(path: string): Promise<LoadedBlueprint> {
  try {
    return validate(
      Object.freeze({
        ...require(path),
        path,
      }),
    );
  } catch (error) {
    throw new Error(`Invalid blueprint at ${path}: ${error.message}`);
  }
}

/**
 * Scans multiple locations for blueprint files and returns a single map.
 *
 * @param locations Locations to scan.
 */
export async function scanAll(
  locations: string[],
): Promise<Blueprints<LoadedBlueprint>> {
  let blueprints: Blueprints<LoadedBlueprint> = {};

  for (let location of locations) {
    blueprints = {
      ...blueprints,
      ...(await scan(location)),
    };
  }

  return blueprints;
}

/**
 * Scans the given location for blueprint files, validates and loads them and returning them
 * as a map where the key corresponds to the resulting blueprint command name. On nested blueprints,
 * the command name will include the whole path to the actual blueprint.
 *
 * @param location Location to scan
 * @param parents Parent blueprint names
 */
export async function scan(
  location: string,
  parents: string[] = [],
): Promise<Blueprints<LoadedBlueprint>> {
  let blueprints: Blueprints<LoadedBlueprint> = {};
  const candidates = glob.sync('*/*', {
    cwd: location,
    absolute: true,
  });

  for (let path of candidates) {
    const directory = dirname(path);
    const base = basename(directory);
    const name = [...parents, base].join(':');

    if (basename(path) === 'blueprint.js') {
      blueprints = {
        ...blueprints,
        [name]: await load(path),
      };
    }

    blueprints = {
      ...blueprints,
      ...(await scan(directory, [...parents, base])),
    };
  }

  return blueprints;
}

/**
 * Creates a blueprint and returns it.
 * Actually, the passed blueprint object is already a blueprint, but the alias makes generic typing
 * easier to use.
 *
 * @param blueprint Blueprint to create.
 */
export function create<T>(blueprint: Blueprint<T>): Blueprint<T> {
  return blueprint;
}

/**
 * Executes a blueprint.
 *
 * @param blueprint Blueprint to execute.
 * @param args Arguments to pass.
 * @param env Environment to use.
 */
export async function execute<T>(
  blueprint: Blueprint<T>,
  args: T,
  memfs: Editor,
  env: Environment,
) {
  await new Listr(normalizeTasks([blueprint.create(args, env)]), {
    concurrent: false,
    renderer: UpdateRenderer,
    collapse: false,
  } as any).run({ memfs, env });

  await new Promise(resolve => {
    memfs.commit(() => {
      resolve();
    });
  });
}
