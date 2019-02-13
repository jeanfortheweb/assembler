import { createYargs } from './lib';
import { findBlueprintLocations, getProjectRoot } from './lib';

async function run() {
  const root = await getProjectRoot();
  const locations = await findBlueprintLocations(root);

  if (locations.length === 0) {
    console.error('Found no blueprint locations');
  }

  const argv = createYargs(root, locations);
  argv
    .demandCommand()
    .fail((msg, err) => {
      if (!err) {
        console.log(msg);
      }
    })
    .help().argv;
}

run();
