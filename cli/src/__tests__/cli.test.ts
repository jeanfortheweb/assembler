import { mkdirp, pathExistsSync } from 'fs-extra';
import { join } from 'path';
import temp from 'temp';
import {
  getProjectRoot,
  findBlueprintLocations,
  createYargs,
  run,
} from '../cli';
import { createPackage, executeYargs } from './helpers';
import { scanAll } from '../blueprints';

describe('getProjectRoot', () => {
  test('should find the package root', async () => {
    const path = await createPackage({});
    const prev = process.cwd();

    process.chdir(path);

    const root = await getProjectRoot();

    process.chdir(prev);

    expect(root).toContain(path);
  });
});

describe('findBlueprintLocations', () => {
  test('should include custom and default location', async () => {
    const path = await createPackage({
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
    const path = await createPackage({
      assembler: {},
    });

    const defaultLocation = join(path, 'blueprints');

    await mkdirp(defaultLocation);

    expect(await findBlueprintLocations(path)).toEqual([defaultLocation]);
  });
});

describe('createYargs', () => {
  test('creates argv as expected', async () => {
    const blueprints = await scanAll([join(__dirname, 'blueprints')]);
    const argv = await createYargs(blueprints);

    const { output } = await executeYargs(argv, '--help');

    expect(output).toMatch(/directory:create <path>\s+creates a directory/);
    expect(output).toMatch(/directory:remove <path>\s+removes a directory/);
    expect(output).toMatch(/file <name>\s+creates a file/);
    expect(output).not.toMatch(/--force/);
    expect(output).not.toMatch(/name of directory/);
  });

  test('creates subcommands as expected', async () => {
    const blueprints = await scanAll([join(__dirname, 'blueprints')]);
    const argv = await createYargs(blueprints);

    const { output: createOutput } = await executeYargs(
      argv,
      'directory:create --help',
    );

    expect(createOutput).toMatch(/creates a directory\n/);
    expect(createOutput).toMatch(/--force/);

    const { output: removeOutput } = await executeYargs(
      argv,
      'directory:remove --help',
    );

    expect(removeOutput).toMatch(/removes a directory\n/);
    expect(removeOutput).toMatch(/name of directory/);

    const { output: fileOutput } = await executeYargs(argv, 'file --help');

    expect(fileOutput).toMatch(/creates a file\n/);
  });
});

describe('run', () => {
  const root = __dirname;

  beforeAll(() => {
    console.log = jest.fn;
  });

  test('should fail without blueprint name', async () => {
    await expect(run('/temp', '')).rejects.toThrow(
      'Found no blueprint locations.',
    );
  });

  test('should run blueprints', async () => {
    const directory = join(temp.mkdirSync(), 'test');
    const file = join(directory, 'file.txt');

    await run(root, ['directory:create', directory]);

    expect(pathExistsSync(directory)).toBeTruthy();

    await run(root, ['directory:remove', directory]);

    expect(pathExistsSync(directory)).toBeFalsy();

    await run(root, ['file', file]);

    expect(pathExistsSync(file)).toBeTruthy();
  });
});
