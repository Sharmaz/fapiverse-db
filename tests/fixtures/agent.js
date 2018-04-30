// Definimos el fixture de agent
const agent = {
  id: 1,
  uuid: 'yyy-yyy-yyy',
  name: 'fixture',
  username: 'fapi',
  hostname: 'test-host',
  pid: 0,
  connected: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

// Función para sobre-escribir un objeto
function extend(obj, values) {
  // Clonamos el objeto
  const clone = Object.assign({}, obj);

  // Le reemplazamos valores al clon
  return Object.assign(clone, values);
}

// Definimos un arreglo de agentes
const agents = [
  agent,
  extend(agent, {
    id: 2,
    uuid: 'yyy-yyy-yyw',
    username: 'test',
    connected: true,
  }),
  extend(agent, { id: 3, uuid: 'yyy-yyy-yyx' }),
  extend(agent, { id: 4, uuid: 'yyy-yyy-yyz', username: 'test' }),
];

// Exportamos el agente, el arreglo de agentes y algunas funciones con filter
module.exports = {
  single: agent,
  all: agents,
  connected: agents.filter(a => a.connected),
  fapi: agents.filter(a => a.username === 'fapi'),
  byUuid: id => agents.filter(a => a.uuid === id).shift(),
  byId: id => agents.filter(a => a.id === id).shift(),
};
