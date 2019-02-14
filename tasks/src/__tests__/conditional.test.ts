import conditional from '../conditional';
import { task } from '@bluprint/cli';

test('should return a task with enabled set', () => {
  const taskToUse = task('with true', async () => {});

  expect(conditional(true, taskToUse)).toEqual({
    description: 'with true',
    enabled: true,
    execute: taskToUse.execute,
  });

  expect(conditional(false, taskToUse)).toEqual({
    description: 'with true',
    enabled: false,
    execute: taskToUse.execute,
  });
});
