// seed.js - Run this once to create/reset test accounts
// Usage: node seed.js
require('dotenv').config({ path: '.env' });
const { Pool } = require('pg');
const bcrypt = require('bcrypt');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const testUsers = [
  { name: 'Test Farmer', email: 'farmer@test.com', password: 'password123', role: 'farmer' },
  { name: 'Test Buyer',  email: 'buyer@test.com',  password: 'password123', role: 'buyer'  },
];

async function seed() {
  for (const u of testUsers) {
    const hash = await bcrypt.hash(u.password, 10);

    // Upsert: insert or update password if email already exists
    const res = await pool.query(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (email)
       DO UPDATE SET name = EXCLUDED.name, password_hash = EXCLUDED.password_hash, role = EXCLUDED.role
       RETURNING id, email, role`,
      [u.name, u.email, hash, u.role]
    );
    console.log(`✅ ${res.rows[0].role.toUpperCase()} upserted → id:${res.rows[0].id}  email:${res.rows[0].email}`);
  }
  await pool.end();
  console.log('\nDone! You can now log in with password: password123');
}

seed().catch(err => { console.error('Seed failed:', err.message); process.exit(1); });
