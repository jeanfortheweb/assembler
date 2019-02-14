const { create } = require('../../../blueprints');

module.exports = create({
  arguments: '<name>',
  description: 'creates a file',
  create: ({ name }) => ({
    description: 'writing file',
    execute: async ({ memfs, env }) => {
      memfs.write(env.destination(name), '');
    },
  }),
});
