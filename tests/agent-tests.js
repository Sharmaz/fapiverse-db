const test = require('ava');
const sinon = require('sinon');
const proxyquire = require('proxyquire');
const agentFixtures = require('./fixtures/agent');

// Definimos la configuración y desactivamos la propiedad logging
const config = {
  logging: false,
};

// Definimos el Stub de Metric, a belongsTo le asignamos el Spy de sinon
const MetricStub = {
  belongsTo: sinon.spy(),
};

// Clonamos el objeto single
const single = Object.assign({}, agentFixtures.single);
const id = 1;

// Definimos como null las siguientes variables
let AgentStub = null;
let db = null;
let sandbox = null;

test.beforeEach(async () => {
  // Creamos un sandbox
  sandbox = sinon.sandbox.create();

  // Definimos el Stub de Agent, al hasMany le asignamos el Spy de sinon en el sandbox
  AgentStub = {
    hasMany: sandbox.spy(),
  };

  // Función findById como Stub en el modelo
  AgentStub.findById = sandbox.stub();

  // Cuando la función se llame con el id va a retornar una promesa con agentFixtures y el id
  AgentStub.findById.withArgs(id).returns(Promise.resolve(agentFixtures.byId(id)));

  // Requerimos los modelos de agent y metric con proxyquire
  const setupDatabase = proxyquire('../', {
    './models/agent': () => AgentStub,
    './models/metric': () => MetricStub,
  });

  db = await setupDatabase(config);
});

// Despues de cada test
test.afterEach(() => {
  // Si sandbox existe vamos a resetearlo
  if (sandbox) sinon.sandbox.restore();
});

// Test de agent
test('Agent', (t) => {
  // Si agent es truthy (existe, no es null o indefined)
  t.truthy(db.Agent, 'Agent service should exist');
});

// Test del setup de la DB, en serie (unos despues de otros, no de manera concurrente)
test.serial('Setup', (t) => {
  /**
   * Las siguientes condiciones son verdaderas:
   * AgentStub es ejecutada con hasMany, MetricStub es ejecutada con belongsTo
   * AgentStub fue llamada con el argumento MetricStub
   * MetricStub fue llamada con el argumento AgentStub
   */
  t.true(AgentStub.hasMany.called, 'AgentModel.hasMany was executed');
  t.true(AgentStub.hasMany.calledWith(MetricStub), 'Argument should be the Metricmodel');
  t.true(MetricStub.belongsTo.called, 'MetricModel.belongsTo was excecuted');
  t.true(MetricStub.belongsTo.calledWith(AgentStub), 'Argument should be the Agentmodel');
});

// Test para los find de Agent
test.serial('Agent#findById', async (t) => {
  const agent = await db.Agent.findById(id);
  /**
   * Testeamos que findById sea llamada, sea llamada solo una vez
   * findById va a ser llamada con id como parametro
   * findById va a ser igual al modelo y a los fixtures
   */
  t.true(AgentStub.findById.called, 'findById should be called on model');
  t.true(AgentStub.findById.calledOnce, 'findById should be called once');
  t.true(AgentStub.findById.calledWith(id), 'findById should be called with id');
  t.deepEqual(agent, agentFixtures.byId(id), 'Should be the same');
});
