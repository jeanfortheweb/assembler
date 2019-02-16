import { scan, validate, load, execute } from '../blueprints';
import { resolve } from 'path';
import { create as createStore } from 'mem-fs';
import { create as createEditor } from 'mem-fs-editor';
import { createEnvironment } from '../environment';

describe('scan', () => {
  const location = resolve(__dirname, 'blueprints');

  test('should create the correct blueprint set from a tree', async () => {
    expect(Object.keys(await scan(location))).toEqual([
      'directory:create',
      'directory:remove',
      'failure',
      'file',
    ]);
  });
});

describe('validate', () => {
  test('should throw on invalid blueprint', async () => {
    expect(() => validate(undefined)).toThrow(
      'Blueprint should export a blueprint object as default.',
    );

    expect(() => validate({})).toThrow('Blueprint should have a path set.');

    expect(() => validate({ path: '' })).toThrow(
      'Blueprint is missing a description.',
    );

    expect(() => validate({ path: '', description: '' })).toThrow(
      'Blueprint is missing a create function.',
    );

    expect(() =>
      validate({ path: '', description: '', create: () => {} }),
    ).not.toThrow();
  });
});

describe('load', () => {
  test('should throw on invalid blueprint at path', async () => {
    await expect(load('path')).rejects.toThrow(
      'Invalid blueprint at path: Blueprint is missing a description.',
    );
  });
});

describe('execute', () => {
  const memfs = createEditor(createStore());

  beforeAll(() => {
    console.log = jest.fn;
  });

  test('should execute a blueprint as expected', async () => {
    const env = await createEnvironment('', '');
    const executer = jest.fn();
    const args = { a: 1 };
    const create = jest.fn(() => task);
    const task = {
      description: 'test',
      execute: executer,
    };
    const blueprint = {
      path: '',
      description: 'test',
      create,
    };

    await execute(blueprint, args, memfs, env);

    expect(create).toHaveBeenCalledWith(args, env);
    expect(executer.mock.calls.length).toEqual(1);
    expect(executer.mock.calls[0][0]).toEqual({ memfs, env });
  });

  test('should not execute a blueprint when the task is disabled', async () => {
    const env = await createEnvironment('', '');
    const executer = jest.fn();
    const args = { a: 1 };
    const create = jest.fn(() => task);
    const task = {
      description: 'test',
      enabled: false,
      execute: executer,
    };
    const blueprint = {
      path: '',
      description: 'test',
      create,
    };

    await execute(blueprint, args, memfs, env);

    expect(create).toHaveBeenCalledWith(args, env);
    expect(executer.mock.calls.length).toEqual(0);
  });
});
