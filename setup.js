const debug = require('debug')('fapiverse:db');
const inquirer = require('inquirer');
const chalk = require('chalk');
const db = require('./');

// Manejamos los errores y cerramos el proceso en caso de error fatal
function handleFatalError(err) {
  // Damos estilo a la salida en consola del error
  console.error(`${chalk.red('[fatal error]')} ${err.message}`);
  console.error(err.stack);
  process.exit(1);
}

// Creamos un prompt para inquirer
const prompt = inquirer.createPromptModule();


async function setup() {
  // Recibimos respuesta del usuario
  const answer = await prompt([
    {
      type: 'confirm',
      name: 'setup',
      message: 'This going to destroy your database, are you sure?',
    },
  ]);

  // Si la respuesta no existe no realizamos cambios
  if (!answer.setup) {
    return console.log('No changes were made in Database');
  }
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
