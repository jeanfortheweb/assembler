import execa from 'execa';
import { createTask } from '@bluprint/cli';

export default function prettier(...files: string[]) {
  return createTask(`Prettify`, async (environment, task) => {
    if (
      'prettier' in environment.package.devDependencies ||
      'prettier' in environment.package.dependencies
    ) {
      await execa('yarn', ['prettier', '--write', ...files]);
    } else {
      task.skip('No local prettier found.');
    }
  });
}
