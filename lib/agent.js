// Exportamos la función setupAgent
module.exports = function setupAgent(AgentModel) {
  // Creación o Actualización de un agente
  async function createOrUpdate(agent) {
    const condition = {
      where: {
        uuid: agent.uuid,
      },
    };

    const existingAgent = await AgentModel.findOne(condition);

    // Si el agente existe lo actualizamos
    if (existingAgent) {
      const updated = await AgentModel.update(agent, condition);
      return updated ? AgentModel.findOne(condition) : existingAgent;
    }

    // Si el agente no existe lo vamos a crear
    const result = await AgentModel.create(agent);
    return result.toJSON();
  }

  // Función de obtener un agente por ID
  function findById(id) {
    // Retornamos el llamado a la misma función que esta en el modelo
    return AgentModel.findById(id);
  }

  // Función de obtener un agente por uuid
  function findByUuid(uuid) {
    return AgentModel.findOne({
      where: {
        uuid,
      },
    });
  }

  // Función de obtener todos los agentes
  function findAll() {
    return AgentModel.findAll();
  }

  // Función para obtener los agentes conectados
  function findConnected() {
    return AgentModel.findAll({
      where: {
        connected: true,
      },
    });
  }

  // Función de obtener un agente por username
  function findByUsername(username) {
    return AgentModel.findAll({
      where: {
        username,
        connected: true,
      },
    });
  }


  // Retornamos findById
  return {
    findAll,
    findConnected,
    findByUsername,
    findByUuid,
    findById,
    createOrUpdate,
  };
};
