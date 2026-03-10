const { pool } = require("../config/db");

async function createProduct(farmer_id, name, description, price_cents, stock) {
  const result = await pool.query(
    "INSERT INTO products (farmer_id, name, description, price_cents, stock) VALUES ($1, $2, $3, $4, $5) RETURNING *",
    [farmer_id, name, description, price_cents, stock]
  );
  return result.rows[0];
}

async function getAllProducts() {
  const result = await pool.query("SELECT * FROM products ORDER BY created_at DESC");
  return result.rows;
}

async function getProductById(id) {
  const result = await pool.query("SELECT * FROM products WHERE id = $1", [id]);
  return result.rows[0];
}

async function updateProduct(id, name, description, price_cents, stock) {
  const result = await pool.query(
    "UPDATE products SET name = $1, description = $2, price_cents = $3, stock = $4 WHERE id = $5 RETURNING *",
    [name, description, price_cents, stock, id]
  );
  return result.rows[0];
}

async function deleteProduct(id) {
  const result = await pool.query("DELETE FROM products WHERE id = $1 RETURNING id", [id]);
  return result.rows[0];
}

async function getProductsByFarmer(farmer_id) {
  const result = await pool.query("SELECT * FROM products WHERE farmer_id = $1 ORDER BY created_at DESC", [farmer_id]);
  return result.rows;
}

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getProductsByFarmer,
};
