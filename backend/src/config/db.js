const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");
const config = require("./env");

const isProduction = process.env.NODE_ENV === "production";
const isRenderOrRailway = config.databaseUrl && !config.databaseUrl.includes("localhost") && !config.databaseUrl.includes("postgres:5432");

const pool = new Pool({
  connectionString: config.databaseUrl,
  ssl: (isProduction || isRenderOrRailway) ? { rejectUnauthorized: false } : false,
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
  seedDatabase,
};

