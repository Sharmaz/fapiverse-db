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
const uuid = 'yyy-yyy-yyy';

// Definimos argumentos para connected, username, uuid y nuevo agente
const connectedArgs = {
  where: { connected: true },
};
const usernameArgs = {
  where: { username: 'fapi', connected: true },
};
const uuidArgs = {
  where: { uuid },
};
const newAgent = {
  uuid: '123-123-123',
  name: 'test',
  username: 'test',
  hostname: 'test',
  pid: 0,
  connected: false,
};

test.beforeEach(async () => {
  // Creamos un sandbox
  sandbox = sinon.sandbox.create();

  // Definimos el Stub de Agent, al hasMany le asignamos el Spy de sinon en el sandbox
  AgentStub = {
    hasMany: sandbox.spy(),
  };

  /**
   * Función findOne como stub del modelo
   * retornamos la promesa por medio de los fixtures y el uuid
   */
  AgentStub.findOne = sandbox.stub();
  AgentStub.findOne.withArgs(uuidArgs).returns(Promise.resolve(agentFixtures.byUuid(uuid)));

  /**
   * Función findById como stub del modelo
   * Cuando se llame con el id va a retornar una promesa con agentFixtures y el id
   */
  AgentStub.findById = sandbox.stub();
  AgentStub.findById.withArgs(id).returns(Promise.resolve(agentFixtures.byId(id)));

  /**
   * Función update como stub del modelo
   * Cuando se llame vamos a retornar la promesa
   */
  AgentStub.update = sandbox.stub();
  AgentStub.update.withArgs(single, uuidArgs).returns(Promise.resolve(single));

  /**
   * Función create como stub del modelo
   * Retornamos la promesa con una función que retorna el nuevo agente
   */
  AgentStub.create = sandbox.stub();
  AgentStub.create.withArgs(newAgent).returns(Promise.resolve({
    toJSON() {
      return newAgent;
    },
  }));

  /**
   * Función findAll como stub del modelo
   * Retornamos la promesa sin argumenos
   * Retornamos la promesa con argumento de agentes conectados
   * Retornamos la promesa con argumento de usarname
   */
  AgentStub.findAll = sandbox.stub();
  AgentStub.findAll.withArgs().returns(Promise.resolve(agentFixtures.all));
  AgentStub.findAll.withArgs(connectedArgs).returns(Promise.resolve(agentFixtures.connected));
  AgentStub.findAll.withArgs(usernameArgs).returns(Promise.resolve(agentFixtures.fapi));

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

// Test para los update de Agent
test.serial('Agent#createOrUpdate - Exist', async (t) => {
  const agent = await db.Agent.createOrUpdate(single);

  /**
   * Testeamos que findOne sea llamada, sea llamada 2 veces
   * update va a cer llamada una vez
   * update en agent y single van a ser iguales
   */
  t.true(AgentStub.findOne.called, 'findOne should be called on Model');
  t.true(AgentStub.findOne.calledTwice, 'findOne should be called twice');
  t.true(AgentStub.update.calledOnce, 'update should be called once');
  t.deepEqual(agent, single, 'Should be the same');
});

// Test para el create de Agent
test.serial('Agent#createOrUpdate - New', async (t) => {
  const agent = await db.Agent.createOrUpdate(newAgent);
  /**
   * Testeamos que findOne sea llamada, sea llamada una vez
   * findOne va a ser llamada con uuid con argumento
   * create va a ser llamada, va a ser llamada una vez
   * create va a ser llamada con newAgent como argumento
   * agent y newAgent deberian ser iguales
   */
  t.true(AgentStub.findOne.called, 'findOne should be called on model');
  t.true(AgentStub.findOne.calledOnce, 'findOne should be called once');
  t.true(AgentStub.findOne.calledWith({
    where: { uuid: newAgent.uuid },
  }), 'findOne should be called with uuid args');
  t.true(AgentStub.create.called, 'create should be called on model');
  t.true(AgentStub.create.calledOnce, 'create should be called once');
  t.true(AgentStub.create.calledWith(newAgent), 'create should be called with specified args');

  t.deepEqual(agent, newAgent, 'agent should be the same');
});

// Test para obtener el agento por username
test.serial('Agent#findByUsername', async (t) => {
  const agents = await db.Agent.findByUsername('fapi');

  /**
   * Testeamos que findAll sea llamada y sea llamada una vez
   * findAll debe ser lladada con usernameArgs como argumento
   * agents y agentFixtures.fapi deben tener el mismo length
   * agents y agentFixtures.fapi deben de ser iguales
   */
  t.true(AgentStub.findAll.called, 'findAll should be called on model');
  t.true(AgentStub.findAll.calledOnce, 'findAll should be called once');
  t.true(AgentStub.findAll.calledWith(usernameArgs), 'findAll should be called with username args');

  t.is(agents.length, agentFixtures.fapi.length, 'agents should be the same amount');
  t.deepEqual(agents, agentFixtures.fapi, 'agents should be the same');
});

// Test para obtener los agentes que esten conectados
test.serial('Agent#findConnected', async (t) => {
  const agents = await db.Agent.findConnected();

  /**
   * Testeamos si findAll es llamada y es llamada una vez
   * findAll debe se llamada con connectedArgs como argumento
   * agents y agentFixtures.connected debe tener el mismo length
   * agents y agentFixtures.connected deben ser iguales
   */
  t.true(AgentStub.findAll.called, 'findAll should be called on model');
  t.true(AgentStub.findAll.calledOnce, 'findAll should be called once');
  t.true(AgentStub.findAll.calledWith(connectedArgs), 'findAll should be called with connected args');

  t.is(agents.length, agentFixtures.connected.length, 'agents should be the same amount');
  t.deepEqual(agents, agentFixtures.connected, 'agents should be the same');
});

// Test para obtener todos los agentes
test.serial('Agent#findAll', async (t) => {
  const agents = await db.Agent.findAll();

  /**
   * Testeamos que findAll sea llamada y sea llamada una vez
   * findAll debe ser llamada sin argumentos
   * agents y agentFixtures.all deben tener el mismo length
   * agents y agentFixtures.all deben ser iguales
   */
  t.true(AgentStub.findAll.called, 'findAll should be called on model');
  t.true(AgentStub.findAll.calledOnce, 'findAll should be called once');
  t.true(AgentStub.findAll.calledWith(), 'findAll should be called without args');

  t.is(agents.length, agentFixtures.all.length, 'agents should be the same amount');
  t.deepEqual(agents, agentFixtures.all, 'agents should be the same');
});
