const debug = require('debug')('fapiverse:db');
const db = require('./');

// Manejamos los errores y cerramos el proceso en caso de error fatal
function handleFatalError(err) {
  console.error(err.message);
  console.error(err.stack);
  process.exit(1);
}

async function setup() {
  /**
   * Creamos la configuración de la base de datos
   * dialect nos permite espicificar el motor de SQL
   * logging nos permite configurar el output en consola
   */
  const config = {
    database: process.env.DB_NAME || 'fapiverse',
    username: process.env.DB_USER || 'fapi',
    password: process.env.DB_PASS || 'fapi',
    host: process.env.DB_HOST || 'localhost',
    dialect: 'postgres',
    logging: message => debug(message),
    setup: true,
  };

  await db(config).catch(handleFatalError);

  // Si todo esta bien mandamos mensaje en consola y salimos del proceso
  console.log('Success!');
  process.exit(0);
}

// Corremos el setup
setup();
