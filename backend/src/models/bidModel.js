const { pool } = require("../config/db");

async function placeBid(auction_id, user_id, bid_amount) {
  const result = await pool.query(
    "INSERT INTO bids (auction_id, user_id, bid_amount) VALUES ($1, $2, $3) RETURNING *",
    [auction_id, user_id, bid_amount]
  );
  return result.rows[0];
}

async function getBidsByAuction(auction_id) {
  const result = await pool.query(
    "SELECT * FROM bids WHERE auction_id = $1 ORDER BY bid_amount DESC, created_at DESC",
    [auction_id]
  );
  return result.rows;
}

async function getHighestBid(auction_id) {
  const result = await pool.query(
    "SELECT * FROM bids WHERE auction_id = $1 ORDER BY bid_amount DESC LIMIT 1",
    [auction_id]
  );
  return result.rows[0];
}

module.exports = {
  placeBid,
  getBidsByAuction,
  getHighestBid,
};
