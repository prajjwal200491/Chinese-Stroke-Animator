require('dotenv').config();
const sql = require('mssql');

// All secrets come from environment variables (Azure App Service > Configuration,
// or a local .env file which is gitignored). Never commit real credentials.
const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER, // e.g. hanzi-server.database.windows.net
  database: process.env.DB_NAME, // e.g. hanzi-list
  options: {
    encrypt: true, // required for Azure SQL
    enableArithAbort: true,
  },
  // Give the pool room to resume a serverless Azure SQL DB that was auto-paused.
  connectionTimeout: 30000,
  requestTimeout: 30000,
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
};

// Optionally allow a full connection string to override the discrete fields.
if (process.env.DB_CONNECTION_STRING) {
  config.connectionString = process.env.DB_CONNECTION_STRING;
}

let pool;        // the current live pool, if any
let connecting;  // an in-flight connection attempt, if any

// Returns a healthy, connected pool. If the connection was dropped (e.g. Azure SQL
// serverless auto-pause or a failover), it transparently rebuilds a new one instead
// of leaving every request to fail with a 500 until the app is restarted.
async function getPool() {
  if (pool && pool.connected) return pool;
  if (connecting) return connecting;

  connecting = (async () => {
    try {
      const p = new sql.ConnectionPool(config);
      // If the pool errors later, discard it so the next call reconnects.
      p.on('error', (err) => {
        console.error('Database pool error; will reconnect on next request', err);
        pool = null;
      });
      await p.connect();
      console.log('Connected to the database');
      pool = p;
      return pool;
    } finally {
      connecting = null;
    }
  })();

  return connecting;
}

module.exports = {
  getPool,
};
