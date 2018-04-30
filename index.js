const setupDatabase = require('./lib/db');
const setupAgentModel = require('./models/agent');
const setupMetricModel = require('./models/metric');
const defaults = require('defaults');

// Exportamos el modulo
module.exports = async function db(config) {
  // Seteamos la configuración de prueba con defaults
  config = defaults(config, {
    dialect: 'sqlite',
    pool: {
      max: 10,
      min: 0,
      idle: 10000,
    },
    query: {
      raw: true,
    },
  });

  const sequelize = setupDatabase(config);
  const AgentModel = setupAgentModel(config);
  const MetricModel = setupMetricModel(config);

  // Definimos las relaciones de las entidades
  AgentModel.hasMany(MetricModel);
  MetricModel.belongsTo(AgentModel);

  // Validamos que la DB este bien configurada
  await sequelize.authenticate();

  // Si la propiedad de setup en la configuración es true
  if (config.setup) {
    /**
     * Sincronizamos la base de datos en nuestro servidor
     * force: true, Si existe la DB se borra y se crea una nueva
     */
    await sequelize.sync({ force: true });
  }

  const Agent = {};
  const Metric = {};

  return {
    Agent,
    Metric,
  };
};
