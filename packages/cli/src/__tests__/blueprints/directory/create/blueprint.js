const { create } = require('../../../../blueprints');
const { mkdirp } = require('fs-extra');

module.exports = create({
  arguments: '<path>',
  description: 'creates a directory',
  configure: argv => argv.option('force', { boolean: true }),
  create: ({ path }) => ({
    description: 'creating directory',
    execute: async ({ env }) => {
      await mkdirp(env.destination(path));
    },
  }),
});
