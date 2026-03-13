require('dotenv').config({ path: '.env' });
const { Pool } = require('pg');
const bcrypt = require('bcrypt');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function seed() {
  const accounts = [
    { name: 'Admin',       email: 'admin@farm2home.com',  password: 'admin@123',    role: 'admin'  },
    { name: 'Test Farmer', email: 'farmer@test.com',       password: 'password123', role: 'farmer' },
    { name: 'Test Buyer',  email: 'buyer@test.com',        password: 'password123', role: 'buyer'  },
  ];

  for (const u of accounts) {
    const hash = await bcrypt.hash(u.password, 10);
    const res = await pool.query(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (email)
       DO UPDATE SET name = EXCLUDED.name, password_hash = EXCLUDED.password_hash, role = EXCLUDED.role
       RETURNING id, email, role`,
      [u.name, u.email, hash, u.role]
    );
    console.log(`✅ ${res.rows[0].role.toUpperCase().padEnd(7)} → ${res.rows[0].email}  (id: ${res.rows[0].id})`);
  }
  await pool.end();
  console.log('\nAll accounts ready!');
}

seed().catch(err => { console.error('Failed:', err.message); process.exit(1); });
