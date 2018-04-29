const test = require('ava');
const setupDatabase = require('../');

let config = {
  logging: false,
};

let db = null;

test.beforeEach(async () => {
  db = await setupDatabase(config);
});

test('Agent', (t) => {
  t.truthy(db.Agent, 'Agent service should exist');
});
