const Sequlize = require('sequelize');
const setupDatabase = require('../lib/db');

// Exportamos la función setupAgentModel
module.exports = function setupAgentModel(config) {
  const sequelize = setupDatabase(config);

  // Retornamos el esquema de nuestro modelo agent
  return sequelize.define('agent', {
    uuid: {
      type: Sequlize.STRING,
      allowNull: false,
    },
    name: {
      type: Sequlize.STRING,
      allowNull: false,
    },
    username: {
      type: Sequlize.STRING,
      allowNull: false,
    },
    hostname: {
      type: Sequlize.STRING,
      allowNull: false,
    },
    pid: {
      type: Sequlize.INTEGER,
      allowNull: false,
    },
    connected: {
      type: Sequlize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  });
};
