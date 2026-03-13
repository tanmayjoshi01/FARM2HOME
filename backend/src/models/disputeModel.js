const { pool } = require('../config/db');

async function createDispute(buyer_id, farmer_id, auction_id, issue_type, description) {
  const result = await pool.query(
    `INSERT INTO disputes (buyer_id, farmer_id, auction_id, issue_type, description)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [buyer_id, farmer_id, auction_id || null, issue_type, description || '']
  );
  return result.rows[0];
}

async function getAllDisputes() {
  const result = await pool.query(`
    SELECT d.*,
      b.name AS buyer_name,
      f.name AS farmer_name
    FROM disputes d
    LEFT JOIN users b ON b.id = d.buyer_id
    LEFT JOIN users f ON f.id = d.farmer_id
    ORDER BY d.created_at DESC
  `);
  return result.rows;
}

async function updateDisputeStatus(id, status) {
  const result = await pool.query(
    `UPDATE disputes SET status = $1 WHERE id = $2 RETURNING *`,
    [status, id]
  );
  return result.rows[0];
}

module.exports = { createDispute, getAllDisputes, updateDisputeStatus };
