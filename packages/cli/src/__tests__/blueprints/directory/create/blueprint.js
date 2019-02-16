const { create } = require('../../../../blueprints');
const { mkdirp } = require('fs-extra');

module.exports = create({
  arguments: '<path>',
  description: 'creates a directory',
  configure: argv =>
    argv.option('force', { boolean: true }).positional('path', {
      description: 'path to create',
    }),
  create: ({ path }) => ({
    description: 'creating directory',
    execute: async ({ env }) => {
      await mkdirp(env.destination(path));
    },
  }),
});
