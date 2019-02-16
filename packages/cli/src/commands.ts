import { CommandModule } from 'yargs';
import { create as createStore } from 'mem-fs';
import { create as createEditor } from 'mem-fs-editor';
import { Blueprints, execute, LoadedBlueprint } from './blueprints';
import { createEnvironment } from './environment';
import { dirname } from 'path';

export function generate(
  name: string,
  root: string,
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

export function assemble(
  root: string,
  blueprints: Blueprints<LoadedBlueprint>,
): CommandModule {
  return {
    command: 'assemble <blueprint>',
    describe: 'run a blueprint to assemble code',
    builder: argv => {
      for (let [name, blueprint] of Object.entries(blueprints)) {
        argv = argv.command(generate(name, root, blueprint));
      }

      return argv;
    },
    handler: undefined as any,
  };
}
