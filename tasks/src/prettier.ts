import execa from 'execa';
import { task } from '@bluprint/cli';
import { readJson } from 'fs-extra';

export default function prettier(...files: string[]) {
  return task('Prettify', async ({ env }, task) => {
    const json = await readJson(env.destination('package.json'));

    if ('prettier' in json.devDependencies || 'prettier' in json.dependencies) {
      await execa('yarn', ['prettier', '--write', ...files]);
    } else {
      task.skip('No local prettier found.');
    }
  });
}
