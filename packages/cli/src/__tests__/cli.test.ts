import { mkdirp, pathExistsSync } from 'fs-extra';
import { join } from 'path';
import temp from 'temp';
import {
  getProjectRoot,
  findBlueprintLocations,
  createYargs,
  run,
} from '../cli';
import { createPackage, executeYargs, expectYargsOutput } from './helpers';

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
      bluprint: {
        locations: ['./custom/location', '/root'],
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
      bluprint: {},
    });

    const defaultLocation = join(path, 'blueprints');

    await mkdirp(defaultLocation);

    expect(await findBlueprintLocations(path)).toEqual([defaultLocation]);
  });
});

describe('createYargs', () => {
  test('creates argv as expected', async () => {
    const argv = await createYargs(join(__dirname, 'blueprints'));

    const { output } = await executeYargs(argv, '--help');

    expect(output).toMatch(
      /assemble <blueprint>  run a blueprint to assemble code/,
    );
  });

  test('creates assemble commands as expected', async () => {
    await expectYargsOutput(
      await createYargs(__dirname),
      'assemble --help',
      /directory:create <path>\s+creates a directory/,
      /directory:remove <path>\s+removes a directory/,
      /file <name>\s+creates a file/,
    );

    await expectYargsOutput(
      await createYargs(__dirname),
      'assemble directory:create --help',
      /creates a directory/,
      /--force/,
      /path to create/,
    );

    await expectYargsOutput(
      await createYargs(__dirname),
      'assemble directory:remove --help',
      /removes a directory/,
      /--force/,
      /path to remove/,
    );

    await expectYargsOutput(
      await createYargs(__dirname),
      'assemble file --help',
      /creates a file/,
    );
  });
});

describe('run', () => {
  const root = __dirname;

  beforeAll(() => {
    console.log = jest.fn;
  });

  test('should run blueprints as expected', async () => {
    const directory = join(temp.mkdirSync(), 'test');
    const file = join(directory, 'file.txt');

    await run(root, ['assemble', 'directory:create', directory]);

    expect(pathExistsSync(directory)).toBeTruthy();

    await run(root, ['assemble', 'directory:remove', directory]);

    expect(pathExistsSync(directory)).toBeFalsy();

    await run(root, ['assemble', 'file', file]);

    expect(pathExistsSync(file)).toBeTruthy();

    await run(root, ['assemble', 'failure']);
  });
});
