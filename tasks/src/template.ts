import { Data } from 'ejs';
import * as voca from 'voca';
import { pathExists } from 'fs-extra';
import { createTask } from '@assembler/cli';

export default function template(
  source: string,
  destination: string,
  force: boolean,
  data: Data,
) {
  return createTask(`Create ${destination}`, async environment => {
    if ((await pathExists(destination)) === true && force === false) {
      throw new Error(`${destination} already exists`);
    }

    environment.fs.copyTpl(source, destination, {
      data,
      helpers: voca,
    });
  });
}
