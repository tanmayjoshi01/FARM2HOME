const { pool } = require("../config/db");

async function createAuction(product_id, start_price, start_time, end_time, minimum_increment = 100) {
  const result = await pool.query(
    "INSERT INTO auctions (product_id, start_price, current_price, start_time, end_time, minimum_increment, status) VALUES ($1, $2, $2, $3, $4, $5, 'active') RETURNING *",
    [product_id, start_price, start_time, end_time, minimum_increment]
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
  // If updating both price and winner
  if (winner_id !== null) {
    const result = await pool.query(
      "UPDATE auctions SET current_price = $1, winner_id = $2 WHERE id = $3 RETURNING *",
      [current_price, winner_id, id]
    );
    return result.rows[0];
  }

  // If updating only price
  const result = await pool.query(
    "UPDATE auctions SET current_price = $1 WHERE id = $2 RETURNING *",
    [current_price, id]
  );
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

// Anti-sniping: Extend auction end_time by using interval multiplication
async function extendAuctionEndTime(id, extensionSeconds = 30) {
  const result = await pool.query(
    "UPDATE auctions SET end_time = end_time + (interval '1 second' * $1) WHERE id = $2 RETURNING *",
    [extensionSeconds, id]
  );
  return result.rows[0];
}

// Calculate time remaining for an auction
function calculateTimeRemaining(endTime) {
  const now = new Date();
  const endTimeDate = new Date(endTime);
  const secondsRemaining = Math.max(0, Math.floor((endTimeDate - now) / 1000));
  return secondsRemaining;
}

module.exports = {
  createAuction,
  getAuctionById,
  getActiveAuctions,
  getAllAuctions,
  updateCurrentPrice,
  endAuction,
  getAuctionsByProduct,
  extendAuctionEndTime,
  calculateTimeRemaining,
};
