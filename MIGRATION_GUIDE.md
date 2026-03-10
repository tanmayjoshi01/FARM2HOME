# Migration Guide - Advanced Auction Features

Update your existing database to support new auction features.

## Step 1: Backup Your Database

Before applying changes:

```bash
# Create backup
pg_dump -U your_user farm2home > farm2home_backup.sql

# Restore later if needed
psql -U your_user farm2home < farm2home_backup.sql
```

## Step 2: Apply Database Schema Change

Add the missing column to auctions table:

```sql
ALTER TABLE auctions
ADD COLUMN minimum_increment INTEGER NOT NULL DEFAULT 100 
CHECK (minimum_increment > 0);
```

### Option A: Using psql directly

```bash
psql -U your_user -d farm2home -c "
  ALTER TABLE auctions
  ADD COLUMN minimum_increment INTEGER NOT NULL DEFAULT 100 
  CHECK (minimum_increment > 0);
"
```

### Option B: Using SQL file

```bash
psql -U your_user -d farm2home << EOF
ALTER TABLE auctions
ADD COLUMN minimum_increment INTEGER NOT NULL DEFAULT 100 
CHECK (minimum_increment > 0);
EOF
```

### Option C: Re-initialize from schema

If starting fresh:

```bash
# Drop old database (WARNING: loses all data)
dropdb farm2home

# Create fresh database with new schema
createdb farm2home
psql -U your_user -d farm2home -f database/schema.sql
```

## Step 3: Verify Migration

Check that column was added:

```bash
psql -U your_user -d farm2home -c "
  SELECT column_name, data_type, column_default, is_nullable
  FROM information_schema.columns
  WHERE table_name = 'auctions'
  ORDER BY ordinal_position;
"
```

Expected output includes:
```
minimum_increment | INTEGER | 100 | NO
```

## Step 4: Test the Features

```bash
# Start backend
cd backend
npm run dev
```

Then test each feature:

### Test 1: Create auction with custom increment

```bash
curl -X POST http://localhost:5000/auctions \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "product_id": 1,
    "start_price": 5000,
    "duration_minutes": 5,
    "minimum_increment": 500
  }'
```

### Test 2: View auction with timer

```bash
curl http://localhost:5000/auctions/1 | jq '.auction | {time_remaining_seconds, minimum_increment}'
```

### Test 3: Get bid history

```bash
curl http://localhost:5000/auctions/1/bids
```

## Step 5: Update Existing Auctions (Optional)

If you have existing auctions and want custom increments:

```sql
-- Set different increment for specific auction
UPDATE auctions
SET minimum_increment = 500
WHERE id = 1;

-- Set all auctions to specific increment
UPDATE auctions
SET minimum_increment = 200
WHERE status = 'active';
```

## Rollback (If Needed)

To revert the changes:

```sql
ALTER TABLE auctions
DROP COLUMN minimum_increment;
```

Or restore from backup:

```bash
psql -U your_user farm2home < farm2home_backup.sql
```

## Verification Queries

### Check all auctions have increment

```sql
SELECT id, minimum_increment FROM auctions;
```

### Check constraint works

```sql
-- This should fail (negative value)
INSERT INTO auctions (product_id, start_price, current_price, 
  start_time, end_time, minimum_increment)
VALUES (1, 1000, 1000, NOW(), NOW() + INTERVAL '1 hour', -100);
```

### Verify default value

```sql
INSERT INTO auctions (product_id, start_price, current_price, 
  start_time, end_time)
VALUES (1, 1000, 1000, NOW(), NOW() + INTERVAL '1 hour');

-- Check if minimum_increment is 100
SELECT id, minimum_increment FROM auctions 
WHERE id = (SELECT MAX(id) FROM auctions);
```

## Timeline

- Schema change: ~1 second
- Test creation: ~5 seconds
- Full testing: ~10 minutes

## Files that Changed

1. database/schema.sql
   - Modified: auctions table

2. backend/src/models/auctionModel.js
   - Updated: createAuction()
   - Added: extendAuctionEndTime()
   - Added: calculateTimeRemaining()

3. backend/src/models/bidModel.js
   - Added: getBidHistoryWithBidders()

4. backend/src/controllers/auctionController.js
   - Updated: createAuction()
   - Updated: getAuctionById()
   - Updated: getAuctions()
   - Updated: placeBid()
   - Added: getBidHistory()

5. backend/src/routes/auctionRoutes.js
   - Added: GET /:id/bids route

## After Migration

Your backend now supports:

✓ Anti-sniping auction extension
✓ Minimum bid increments per auction
✓ Live countdown timer
✓ Bid history with bidder names

All existing APIs still work backwards compatible.

