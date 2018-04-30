// Exportamos la función setupAgent
module.exports = function setupAgent(AgentModel) {
  function findById(id) {
    // Retornamos el llamado a la misma función que esta en el modelo
    return AgentModel.findById(id);
  }

  // Retornamos findById
  return {
    findById,
  };
};
