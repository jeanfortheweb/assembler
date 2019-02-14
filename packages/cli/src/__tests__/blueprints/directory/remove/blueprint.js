const { create } = require('../../../../blueprints');
const { remove } = require('fs-extra');

module.exports = create({
  description: 'removes a directory',
  arguments: '<path>',
  configure: argv =>
    argv.boolean('force').positional('name', {
      string: true,
      description: 'name of directory',
    }),
  create: ({ path }) => ({
    description: 'removing directory',
    execute: async ({ env }) => {
      await remove(env.destination(path));
    },
  }),
});
