const { pool } = require("../config/db");

async function createOrder(user_id, product_id, auction_id, quantity, total_price) {
  const result = await pool.query(
    "INSERT INTO orders (user_id, product_id, auction_id, quantity, total_price, status) VALUES ($1, $2, $3, $4, $5, 'pending') RETURNING *",
    [user_id, product_id, auction_id, quantity, total_price]
  );
  return result.rows[0];
}

async function getOrderById(id) {
  const result = await pool.query("SELECT * FROM orders WHERE id = $1", [id]);
  return result.rows[0];
}

async function getOrdersByUser(user_id) {
  const result = await pool.query("SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC", [user_id]);
  return result.rows;
}

async function getAllOrders() {
  const result = await pool.query("SELECT * FROM orders ORDER BY created_at DESC");
  return result.rows;
}

async function updateOrderStatus(id, status) {
  const result = await pool.query(
    "UPDATE orders SET status = $1 WHERE id = $2 RETURNING *",
    [status, id]
  );
  return result.rows[0];
}

module.exports = {
  createOrder,
  getOrderById,
  getOrdersByUser,
  getAllOrders,
  updateOrderStatus,
};
