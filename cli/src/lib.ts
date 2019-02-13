import pkg from 'pkg-up';
import { resolve, dirname, isAbsolute } from 'path';
import { readJson, existsSync } from 'fs-extra';
import { create as createStore } from 'mem-fs';
import { create as createEditor, Editor } from 'mem-fs-editor';
import yargs, { CommandModule, Arguments, CommandBuilder } from 'yargs';
import Listr from 'listr';
//@ts-ignore
import UpdateRenderer = require('listr-update-renderer');

export interface Environment {
  fs: Editor;
  package: any;
  source: (...segments: string[]) => string;
  destination: (...segments: string[]) => string;
}

export interface BlueprintTaskCreator {
  (argv: yargs.Arguments, environment: Environment): Task;
}

export interface BlueprintModule<T = any> {
  name?: string;
  desc?: string;
  args?: BlueprintArgsCreator<T>;
  task?: BlueprintTaskCreator;
}

export interface TaskHelpers {
  title: string;
  output: string;
  skip: (message: string) => void;
}

export interface Task {
  title: string;
  task: (env: Environment, task: TaskHelpers) => Promise<any> | Blueprint;
  enabled?: () => boolean;
}

export type BlueprintArgsCreator<T> = CommandBuilder<T, any>;
export type Blueprint = Listr;

export async function getProjectRoot() {
  return dirname(await pkg(process.cwd()));
}

export async function findBlueprintLocations(root: string) {
  const json = await readJson(resolve(root, 'package.json'));

  let locations = [resolve(await getProjectRoot(), 'blueprints')];

  if (json.assembler && json.assembler.blueprints) {
    locations = [
      ...locations,
      ...json.assembler.blueprints.map((location: string) =>
        isAbsolute(location) ? location : resolve(root, location),
      ),
    ];
  }

  return locations.filter(location => existsSync(location));
}

export async function createEnvironment(
  commandDir: string,
  root: string,
): Promise<Environment> {
  return Object.freeze({
    fs: createEditor(createStore()),
    package: await readJson(resolve(root, 'package.json')),
    source: (...segments: string[]) => resolve(commandDir, ...segments),
    destination: (...segments: string[]) => resolve(root, ...segments),
  });
}

export function createTask(title: string, task: Task['task']): Task {
  return {
    title,
    task: task,
  };
}

export function commit() {
  return createTask(
    'Flush files to disk',
    environment =>
      new Promise((resolve, reject) => {
        environment.fs.commit((err: any) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      }),
  );
}

export function createVisitor(root: string) {
  return (command: BlueprintModule, path?: string, file?: string) => {
    try {
      if (command.task !== undefined) {
        const commandModule: CommandModule = {
          handler: () => {},
        };

        if (command.name) {
          commandModule.command = command.name;
        } else {
          commandModule.command = (file as string).replace('.ts', '');
        }

        commandModule.handler = async (argv: yargs.Arguments) => {
          const environment = await createEnvironment(
            dirname(path as string),
            root,
          );

          const rootTask = (command.task as BlueprintTaskCreator)(
            argv,
            environment,
          );

          await new Listr([rootTask, commit()], {
            concurrent: false,
            renderer: UpdateRenderer,
            collapse: false,
          } as any).run(environment);
        };
        if (command.args !== undefined) {
          commandModule.builder = command.args;
        }

        if (command.desc !== undefined) {
          commandModule.describe = command.desc;
        }

        return commandModule;
      }
    } catch (error) {}
  };
}

export function createYargs(root: string, locations: string[]) {
  return locations.reduce(
    (cmd, location) =>
      cmd.commandDir(location, {
        extensions: ['ts'],
        visit: createVisitor(root),
      }),
    yargs,
  );
}

export function createTaskBuilder<T>(
  builder: (args: Arguments<T>, env: Environment) => Task,
) {
  return builder;
}

export function createArgumentsBuilder<T>(builder: BlueprintArgsCreator<T>) {
  return builder;
}
