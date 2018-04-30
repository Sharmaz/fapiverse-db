const test = require('ava');
const sinon = require('sinon');
const proxyquire = require('proxyquire');

// Definimos la configuración y desactivamos la propiedad logging
const config = {
  logging: false,
};

// Definimos el Stub de Metric, a belongsTo le asignamos el Spy de sinon
const MetricStub = {
  belongsTo: sinon.spy(),
};

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
