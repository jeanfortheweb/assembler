import temp from 'temp';
import { join } from 'path';
import { Environment, createEnvironment } from '../environment';
import { createPackage } from './helpers';

describe('createEnvironment', () => {
  let env: Environment;
  let destination: string;
  let source: string;

  beforeAll(async () => {
    source = temp.mkdirSync();
    destination = await createPackage({});
    env = await createEnvironment(source, destination);
  });

  test('should have the expected interface', () => {
    expect(typeof env.source).toEqual('function');
    expect(typeof env.destination).toEqual('function');
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
