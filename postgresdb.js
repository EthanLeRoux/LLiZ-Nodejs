const { Pool, Client } = require('pg');
const dotenv = require('dotenv');

// pools will use environment variables
// for connection information
const pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME ,
});

//const connectionString = process.env.DB_URL;

// const pool = new Pool({
//     connectionString,
// });
module.exports = pool;