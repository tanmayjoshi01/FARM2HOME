/**
 * Safe Orders Table Migration
 * Run with: node backend/migrate.js
 * 
 * This script safely migrates the orders table to use the new column names:
 *   user_id       → buyer_id
 *   total_price   → amount
 *   status        → payment_status
 * And adds: farmer_id, transaction_id
 * And unique constraint on auction_id
 */

require('dotenv').config({ path: './backend/.env' });
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:Paras08@2006@localhost:5432/farm2home',
});

async function migrate() {
  const client = await pool.connect();
  try {
    console.log('Connected to PostgreSQL. Starting migration...\n');

    // Check current columns
    const cols = await client.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'orders' ORDER BY ordinal_position
    `);
    const columnNames = cols.rows.map(r => r.column_name);
    console.log('Current columns:', columnNames.join(', '));

    await client.query('BEGIN');

    // 1. Rename user_id → buyer_id  
    if (columnNames.includes('user_id') && !columnNames.includes('buyer_id')) {
      await client.query('ALTER TABLE orders RENAME COLUMN user_id TO buyer_id');
      console.log('✓ Renamed user_id → buyer_id');
    } else if (columnNames.includes('buyer_id')) {
      console.log('• buyer_id already exists, skipping');
    }

    // 2. Rename total_price → amount
    if (columnNames.includes('total_price') && !columnNames.includes('amount')) {
      await client.query('ALTER TABLE orders RENAME COLUMN total_price TO amount');
      console.log('✓ Renamed total_price → amount');
    } else if (columnNames.includes('amount')) {
      console.log('• amount already exists, skipping');
    }

    // 3. Rename status → payment_status
    if (columnNames.includes('status') && !columnNames.includes('payment_status')) {
      await client.query('ALTER TABLE orders RENAME COLUMN status TO payment_status');
      console.log('✓ Renamed status → payment_status');
    } else if (columnNames.includes('payment_status')) {
      console.log('• payment_status already exists, skipping');
    }

    // 4. Add farmer_id column if missing
    if (!columnNames.includes('farmer_id')) {
      await client.query('ALTER TABLE orders ADD COLUMN farmer_id BIGINT REFERENCES users(id)');
      console.log('✓ Added farmer_id column');
    } else {
      console.log('• farmer_id already exists, skipping');
    }

    // 5. Add transaction_id column if missing
    if (!columnNames.includes('transaction_id')) {
      await client.query('ALTER TABLE orders ADD COLUMN transaction_id TEXT');
      console.log('✓ Added transaction_id column');
    } else {
      console.log('• transaction_id already exists, skipping');
    }

    // 6. Add unique constraint on auction_id (prevents duplicate orders per auction)
    const constraintCheck = await client.query(`
      SELECT constraint_name FROM information_schema.table_constraints 
      WHERE table_name = 'orders' AND constraint_name = 'unique_auction_order'
    `);
    if (constraintCheck.rows.length === 0) {
      await client.query(`
        ALTER TABLE orders ADD CONSTRAINT unique_auction_order UNIQUE (auction_id)
      `);
      console.log('✓ Added UNIQUE constraint on auction_id');
    } else {
      console.log('• unique_auction_order constraint already exists, skipping');
    }

    // 7. Add image_url to products if missing
    const prodCols = await client.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'products'
    `);
    const prodColNames = prodCols.rows.map(r => r.column_name);
    if (!prodColNames.includes('image_url')) {
      await client.query('ALTER TABLE products ADD COLUMN image_url TEXT');
      console.log('✓ Added image_url column to products');
    } else {
      console.log('• products.image_url already exists, skipping');
    }

    await client.query('COMMIT');
    console.log('\n✅ Migration completed successfully!');

    // Show final schema
    const finalCols = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'orders' ORDER BY ordinal_position
    `);
    console.log('\nFinal orders table columns:');
    finalCols.rows.forEach(r => console.log(` - ${r.column_name} (${r.data_type})`));

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('\n❌ Migration failed:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
