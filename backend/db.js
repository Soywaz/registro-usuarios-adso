const mysql = require('mysql2');
require('dotenv').config();

// Creamos un pool sin especificar la base de datos inicialmente
// para poder crearla si no existe en el server.js
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

const promisePool = pool.promise();

module.exports = promisePool;
