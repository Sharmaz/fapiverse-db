const Sequelize = require('sequelize');

// Definimos la variable sequelize como nulo
let sequelize = null;

module.exports = function setupDatabase(config) {
  // Si sequelize no existe vamos a crearlo y le pasamos configuración
  if (!sequelize) {
    sequelize = new Sequelize(config);
  }

  // Retornamos sequelize
  return sequelize;
};
