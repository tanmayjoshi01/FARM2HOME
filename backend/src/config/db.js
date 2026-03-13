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

async function seedDatabase() {
  try {
    const schemaPath = path.join(__dirname, "../../../database/schema.sql");
    const migratePath = path.join(__dirname, "../../../migrate.sql");

    if (fs.existsSync(schemaPath)) {
      console.log("Running schema.sql...");
      const schemaSql = fs.readFileSync(schemaPath, "utf8");
      await pool.query(schemaSql);
      console.log("Schema applied successfully.");
    }

    if (fs.existsSync(migratePath)) {
      console.log("Running migrate.sql...");
      const migrateSql = fs.readFileSync(migratePath, "utf8");
      await pool.query(migrateSql);
      console.log("Migrations applied successfully.");
    }
  } catch (err) {
    console.error("Database seeding error:", err);
  }
}

module.exports = {
  pool,
  testConnection,
  seedDatabase,
};

