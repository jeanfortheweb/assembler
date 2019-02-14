import execa from 'execa';
import { task } from '@bluprint/cli';
import { readJson } from 'fs-extra';

interface Dependencies {
  devDependencies: string[];
  dependencies: string[];
}

async function getInstalledDependencies(
  packageJSON: any,
): Promise<Dependencies> {
  return {
    devDependencies: Object.keys(packageJSON.devDependencies || {}),
    dependencies: Object.keys(packageJSON.dependencies || {}),
  };
}

function filter(installed: string[], requested: string[]): string[] {
  return requested.filter(
    name => installed.includes(name.replace(/(.+)(@.+)?$/, '$1')) === false,
  );
}

function getMissingDependencies(
  installed: Dependencies,
  requested: Dependencies,
) {
  return {
    devDependencies: filter(
      requested.devDependencies,
      installed.devDependencies,
    ),
    dependencies: filter(requested.dependencies, installed.dependencies),
  };
}

export default function install(
  dependencies: string[] = [],
  devDependencies: string[] = [],
) {
  return task('Install', async ({ env }, task) => {
    const json = await readJson(env.destination('package.json'));
    const installed = await getInstalledDependencies(json);
    const missing = getMissingDependencies(installed, {
      devDependencies,
      dependencies,
    });

    if (
      missing.dependencies.length === 0 &&
      missing.devDependencies.length === 0
    ) {
      task.skip('Nothing to install');
    } else {
      if (missing.dependencies.length > 0) {
        task.output = `yarn add ${missing.dependencies.join(' ')}`;

        await execa('yarn', ['add', ...missing.dependencies]);
      }

      if (missing.devDependencies.length > 0) {
        task.output = `yarn add -D ${missing.devDependencies.join(' ')}`;

        await execa('yarn', ['add', '-D', ...missing.devDependencies]);
      }
    }
  });
}
