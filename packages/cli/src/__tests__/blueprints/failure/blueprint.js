const { create } = require('../../../blueprints');

module.exports = create({
  description: 'a blueprint that fails',
  create: ({ path }) => ({
    description: 'will throw',
    execute: async ({ env }) => {
      throw new Error('Fail');
    },
  }),
});
