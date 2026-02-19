const { Pool } = require("pg");
const config = require("./env");

const pool = new Pool({
  connectionString: config.databaseUrl,
});

async function testConnection() {
  try {
    const client = await pool.connect();
    await client.query("SELECT 1");
    client.release();
    console.log("PostgreSQL connected successfully");
  } catch (error) {
    console.error("Failed to connect to PostgreSQL:", error.message);
    process.exit(1);
  }
}

module.exports = {
  pool,
  testConnection,
};

