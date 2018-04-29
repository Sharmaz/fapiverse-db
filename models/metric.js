const Sequlize = require('sequelize');
const setupDatabase = require('../lib/db');

// Exportamos la función setupMetricModel
module.exports = function setupMetricModel(config) {
  const sequelize = setupDatabase(config);

  // Retornamos el esquema de nuestro modelo metric
  return sequelize.define('metric', {
    type: {
      type: Sequlize.STRING,
      allowNull: false,
    },
    value: {
      type: Sequlize.TEXT,
    },
  });
};
