const CS='Server=tcp:hanzi-server.database.windows.net,1433;Initial Catalog=hanzi-list;Persist Security Info=False;User ID=prajjwal;Password=Acc3ntur3@bang;MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;';
const connectionstring = process.env.dbconnect||CS;
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
    connectionString: connectionstring
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
