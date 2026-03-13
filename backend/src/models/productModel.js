const { pool } = require("../config/db");

async function createProduct(farmer_id, name, description, price_cents, stock, image_url) {
  const result = await pool.query(
    "INSERT INTO products (farmer_id, name, description, price_cents, stock, image_url) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
    [farmer_id, name, description, price_cents, stock, image_url]
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

async function updateProduct(id, name, description, price_cents, stock, image_url) {
  let query = "UPDATE products SET name = $1, description = $2, price_cents = $3, stock = $4";
  const values = [name, description, price_cents, stock];
  
  if (image_url !== undefined) {
    query += ", image_url = $" + (values.length + 1);
    values.push(image_url);
  }
  
  query += " WHERE id = $" + (values.length + 1) + " RETURNING *";
  values.push(id);

  const result = await pool.query(query, values);
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
