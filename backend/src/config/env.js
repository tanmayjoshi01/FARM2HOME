const dotenv = require("dotenv");

dotenv.config();

const config = {
  port: Number(process.env.PORT) || 5000,
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET,
};

if (!config.databaseUrl) {
  console.warn("DATABASE_URL is not set in .env");
}

if (!config.jwtSecret) {
  console.warn("JWT_SECRET is not set in .env");
}

module.exports = config;

