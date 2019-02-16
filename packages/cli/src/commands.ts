import { CommandModule } from 'yargs';
import { create as createStore } from 'mem-fs';
import { create as createEditor } from 'mem-fs-editor';
import { Blueprints, execute, LoadedBlueprint } from './blueprints';
import { createEnvironment } from './environment';
import { dirname } from 'path';

/**
 * Creates a command for each blueprint to run it.
 *
 * @param root Root of the current project.
 * @param name Name of the blueprint.
 * @param blueprint Blueprint to execute.
 */
export function generate(
  root: string,
  name: string,
  blueprint: LoadedBlueprint,
): CommandModule {
  return {
    command: blueprint.arguments ? `${name} ${blueprint.arguments}` : name,
    describe: blueprint.description,
    builder: blueprint.configure,
    handler: async args => {
      const memfs = createEditor(createStore());
      const env = createEnvironment(dirname(blueprint.path), root);

      args.promise = execute(blueprint, args, memfs, env);

      return args.promise;
    },
  };
}

/**
 * Creates the main assemble command which contains each blueprint as
 * subcommand.
 *
 * @param root Root of the current project.
 * @param blueprints Blueprints to integrate.
 */
export function assemble(
  root: string,
  blueprints: Blueprints<LoadedBlueprint>,
): CommandModule {
  return {
    command: 'assemble <blueprint>',
    describe: 'run a blueprint to assemble code',
    builder: argv => {
      for (let [name, blueprint] of Object.entries(blueprints)) {
        argv = argv.command(generate(root, name, blueprint));
      }

      return argv;
    },
    handler: undefined as any,
  };
}
