// connectSqlServer.js
const sql = require("mssql");

const config = {
  user: "sa", // Your SQL Server username
  password: "quangtr28092004", // Your SQL Server password
  server: "localhost", // You might need to change this if your SQL Server is on a different machine
  // or if it's a named instance (e.g., 'localhost\\SQLEXPRESS')
  database: "SWP391", // Your SQL Server database name
  options: {
    encrypt: false, // For Azure SQL Database, this should be true. For local SQL Server, often false.
    trustServerCertificate: true, // Change to true for local dev / self-signed certs
  },
};

const pool = new sql.ConnectionPool(config);

pool
  .connect()
  .then(() => {
    console.log("Connected to SQL Server");
  })
  .catch((err) => {
    console.error("Error connecting to SQL Server:", err);
  });

module.exports = pool;
