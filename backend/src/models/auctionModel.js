const { pool } = require("../config/db");

async function createAuction(product_id, start_price, start_time, end_time) {
  const result = await pool.query(
    "INSERT INTO auctions (product_id, start_price, current_price, start_time, end_time, status) VALUES ($1, $2, $2, $3, $4, 'active') RETURNING *",
    [product_id, start_price, start_time, end_time]
  );
  return result.rows[0];
}

async function getAuctionById(id) {
  const result = await pool.query("SELECT * FROM auctions WHERE id = $1", [id]);
  return result.rows[0];
}

async function getActiveAuctions() {
  const result = await pool.query("SELECT * FROM auctions WHERE status = 'active' ORDER BY created_at DESC");
  return result.rows;
}

async function getAllAuctions() {
  const result = await pool.query("SELECT * FROM auctions ORDER BY created_at DESC");
  return result.rows;
}

async function updateCurrentPrice(id, current_price, winner_id = null) {
  let query = "UPDATE auctions SET current_price = $1";
  const params = [current_price, id];

  if (winner_id !== null) {
    query += ", winner_id = $3";
    params.splice(1, 0, winner_id);
  }

  query += " WHERE id = $" + (params.length - 1) + " RETURNING *";
  params.push(id);

  const result = await pool.query(query, params);
  return result.rows[0];
}

async function endAuction(id, winner_id) {
  const result = await pool.query(
    "UPDATE auctions SET status = 'ended', winner_id = $1 WHERE id = $2 RETURNING *",
    [winner_id, id]
  );
  return result.rows[0];
}

async function getAuctionsByProduct(product_id) {
  const result = await pool.query("SELECT * FROM auctions WHERE product_id = $1 ORDER BY created_at DESC", [product_id]);
  return result.rows;
}

module.exports = {
  createAuction,
  getAuctionById,
  getActiveAuctions,
  getAllAuctions,
  updateCurrentPrice,
  endAuction,
  getAuctionsByProduct,
};
