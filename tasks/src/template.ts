import { Data } from 'ejs';
import * as voca from 'voca';
import { pathExists } from 'fs-extra';
import { task } from '@bluprint/cli';

export default function template(
  source: string,
  destination: string,
  force: boolean,
  data: Data,
) {
  return task(`Create ${destination}`, async ({ memfs }) => {
    if ((await pathExists(destination)) === true && force === false) {
      throw new Error(`${destination} already exists`);
    }

    memfs.copyTpl(source, destination, {
      data,
      helpers: voca,
    });
  });
}
