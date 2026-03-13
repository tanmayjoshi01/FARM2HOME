-- Safe orders table migration
DO $$
BEGIN
  -- Rename user_id → buyer_id
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='user_id') THEN
    ALTER TABLE orders RENAME COLUMN user_id TO buyer_id;
    RAISE NOTICE 'Renamed user_id to buyer_id';
  ELSE
    RAISE NOTICE 'buyer_id already exists, skipping';
  END IF;

  -- Rename total_price → amount
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='total_price') THEN
    ALTER TABLE orders RENAME COLUMN total_price TO amount;
    RAISE NOTICE 'Renamed total_price to amount';
  ELSE
    RAISE NOTICE 'amount already exists, skipping';
  END IF;

  -- Rename status → payment_status
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='status') THEN
    ALTER TABLE orders RENAME COLUMN status TO payment_status;
    RAISE NOTICE 'Renamed status to payment_status';
  ELSE
    RAISE NOTICE 'payment_status already exists, skipping';
  END IF;

  -- Add farmer_id column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='farmer_id') THEN
    ALTER TABLE orders ADD COLUMN farmer_id BIGINT REFERENCES users(id);
    RAISE NOTICE 'Added farmer_id column';
  ELSE
    RAISE NOTICE 'farmer_id already exists, skipping';
  END IF;

  -- Add transaction_id column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='transaction_id') THEN
    ALTER TABLE orders ADD COLUMN transaction_id TEXT;
    RAISE NOTICE 'Added transaction_id column';
  ELSE
    RAISE NOTICE 'transaction_id already exists, skipping';
  END IF;

  -- Add quantity column if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='quantity') THEN
    ALTER TABLE orders ADD COLUMN quantity INT DEFAULT 1;
    RAISE NOTICE 'Added quantity column';
  ELSE
    RAISE NOTICE 'quantity already exists, skipping';
  END IF;

  -- Add image_url to products
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='image_url') THEN
    ALTER TABLE products ADD COLUMN image_url TEXT;
    RAISE NOTICE 'Added image_url to products';
  ELSE
    RAISE NOTICE 'products.image_url already exists, skipping';
  END IF;

END $$;

-- Add unique constraint on auction_id to prevent duplicate auction orders
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_name='orders' AND constraint_name='unique_auction_order'
  ) THEN
    ALTER TABLE orders ADD CONSTRAINT unique_auction_order UNIQUE (auction_id);
    RAISE NOTICE 'Added UNIQUE constraint on auction_id';
  ELSE
    RAISE NOTICE 'unique_auction_order constraint already exists';
  END IF;
EXCEPTION WHEN others THEN
  RAISE NOTICE 'Could not add unique constraint (may have duplicate auction_ids): %', SQLERRM;
END $$;

-- Show final schema
SELECT column_name, data_type FROM information_schema.columns WHERE table_name='orders' ORDER BY ordinal_position;
