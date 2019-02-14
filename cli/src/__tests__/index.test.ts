import * as cli from '../index';

test('should export the expected interface', () => {
  expect(typeof cli.createBlueprint).toEqual('function');
  expect(typeof cli.createTask).toEqual('function');
});
