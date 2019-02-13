import execa from 'execa';
import { createTask } from '@assembler/cli';

export default function install(
  dependencies: string[] = [],
  devDependencies: string[] = [],
) {
  return createTask('Yarn', async (environment, task) => {
    const installedDependencies = Object.keys(
      environment.package.dependencies || {},
    );

    const installedDevDependencies = Object.keys(
      environment.package.devDependencies || {},
    );

    const missingDependencies = dependencies.filter(
      name =>
        installedDependencies.includes(name.replace(/(.+)(@.+)?$/, '$1')) ===
        false,
    );

    const missingDevDependencies = devDependencies.filter(
      name =>
        installedDevDependencies.includes(name.replace(/(.+)(@.+)?$/, '$1')) ===
        false,
    );

    if (
      missingDependencies.length === 0 &&
      missingDevDependencies.length === 0
    ) {
      task.skip('Nothing to install');
    } else {
      if (missingDependencies.length > 0) {
        task.output = `yarn add ${missingDependencies.join(' ')}`;

        await execa(
          'yarn',
          ['add', ...missingDependencies].filter(param => param !== ''),
        );
      }

      if (missingDevDependencies.length > 0) {
        task.output = `yarn add -D ${missingDevDependencies.join(' ')}`;

        await execa(
          'yarn',
          ['add', '-D', ...missingDevDependencies].filter(
            param => param !== '',
          ),
        );
      }
    }
  });
}
