import * as cli from '../index';

test('should export the expected interface', () => {
  expect(typeof cli.blueprint).toEqual('function');
  expect(typeof cli.task).toEqual('function');
  expect(typeof cli.sequential).toEqual('function');
  expect(typeof cli.parallel).toEqual('function');
});
