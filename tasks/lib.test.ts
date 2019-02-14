import {
  findBlueprintLocations,
  getProjectRoot,
  createEnvironment,
  Environment,
  createTask,
  commit,
  createTaskBuilder,
} from '../lib';
import temp from 'temp';
import { writeJsonSync, mkdirp } from 'fs-extra';
import { join, resolve as resolvePath } from 'path';
import { createArgumentBuilder } from '..';
import yargs = require('yargs');

async function createVirtualPackage(data: any): Promise<string> {
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

temp.track();

describe('getProjectRoot', () => {
  test('should find the package root', async () => {
    const path = await createVirtualPackage({});
    const prev = process.cwd();

    process.chdir(path);

    const root = await getProjectRoot();

    process.chdir(prev);

    expect(root).toContain(path);
  });
});

describe('findBlueprintLocations', () => {
  test('should include custom and default location', async () => {
    const path = await createVirtualPackage({
      assembler: {
        blueprints: ['custom/location'],
      },
    });

    const customLocation = join(path, 'custom', 'location');
    const defaultLocation = join(path, 'blueprints');

    await mkdirp(customLocation);
    await mkdirp(defaultLocation);

    expect(await findBlueprintLocations(path)).toEqual([
      defaultLocation,
      customLocation,
    ]);
  });

  test('should include default location only', async () => {
    const path = await createVirtualPackage({
      assembler: {},
    });

    const defaultLocation = join(path, 'blueprints');

    await mkdirp(defaultLocation);

    expect(await findBlueprintLocations(path)).toEqual([defaultLocation]);
  });
});

describe('createEnvironment', () => {
  let env: Environment;
  let destination: string;
  let source: string;

  beforeAll(async () => {
    source = temp.mkdirSync();
    destination = await createVirtualPackage({});
    env = await createEnvironment(source, destination);
  });

  test('should have the expected interface', () => {
    expect(typeof env.fs).toEqual('object');
    expect(typeof env.source).toEqual('function');
    expect(typeof env.destination).toEqual('function');
    expect(typeof env.package).toEqual('object');
  });

  test('should generate the expected source path', () => {
    expect(env.source('file.txt')).toContain(join(source, 'file.txt'));
  });

  test('should generate the expected source path', () => {
    expect(env.destination('file.txt')).toContain(
      join(destination, 'file.txt'),
    );
  });
});

describe('createTask', () => {
  test('should create a task objet', () => {
    const handler = async () => {};
    const task = createTask('title', handler);

    expect(task).toEqual({
      title: 'title',
      task: handler,
    });
  });
});

describe('commit', () => {
  test('should create a task that flushes files to disk', async () => {
    const task = commit();

    expect(task.title).toEqual('Flush files to disk');
    expect(typeof task.task).toEqual('function');
  });
});

describe('createTaskBuilder', () => {
  test('expect to return the function itself', () => {
    const builder = () => commit();

    expect(createTaskBuilder(builder)).toEqual(builder);
  });
});

describe('createArgumentsBuilder', () => {
  test('expect to return the function itself', () => {
    const builder = () => yargs;

    expect(createArgumentBuilder(builder)).toEqual(builder);
  });
});
