const { create } = require('../../../../blueprints');
const { remove } = require('fs-extra');

module.exports = create({
  description: 'removes a directory',
  arguments: '<path>',
  configure: argv =>
    argv.option('force').positional('path', {
      description: 'path to remove',
    }),
  create: ({ path }) => ({
    description: 'removing directory',
    execute: async ({ env }) => {
      await remove(env.destination(path));
    },
  }),
});
