const { pool } = require("../config/db");

async function createUser(name, email, password_hash, role) {
  const result = await pool.query(
    "INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role, created_at",
    [name, email, password_hash, role]
  );
  return result.rows[0];
}

async function getUserByEmail(email) {
  const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
  return result.rows[0];
}

async function getUserById(id) {
  const result = await pool.query("SELECT id, name, email, role, created_at FROM users WHERE id = $1", [id]);
  return result.rows[0];
}

module.exports = {
  createUser,
  getUserByEmail,
  getUserById,
};
