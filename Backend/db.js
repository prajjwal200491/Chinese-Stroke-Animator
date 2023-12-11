const sql = require('mssql');
const config = {
    user: 'prajjwal',
    password: 'Acc3ntur3@bang',
    server: 'hanzi-server.database.windows.net',
    database: 'hanzi-list',
    options: {
      encrypt: true, // Use this if you're on Windows Azure
      enableArithAbort: true,
    },
};

const poolPromise = new sql.ConnectionPool(config)
  .connect()
  .then((pool) => {
    console.log('Connected to the database');
    return pool;
  })
  .catch((err) => {
    console.error('Database connection error', err);
    throw err;
  });

module.exports = {
  poolPromise,
};
