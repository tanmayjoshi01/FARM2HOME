# Farm2Home - Advanced Auction Features

This document describes the production-grade auction features implemented.

## Features Implemented

### 1. Anti-Sniping Auction Extension

When a bid is placed within the last 30 seconds, the auction end_time 
is automatically extended by 30 seconds. This prevents last-second 
bid sniping and ensures fair competition.

**How It Works**:
- Check if time_remaining <= 30 seconds
- If yes, extend end_time by 30 seconds
- Broadcast "auctionExtended" event via WebSocket
- Can trigger multiple times if bids keep coming

**Testing**:
1. Create auction with 2-minute duration
2. Wait 90 seconds (30 sec before end)
3. Place a bid
4. Verify: auction_extended = true in response
5. End time should increase by 30 seconds

---

### 2. Minimum Bid Increment

Each auction has a minimum_increment field (default 100 cents).
New bids must be: current_price + minimum_increment

**Example**:
- current_price = 5000
- minimum_increment = 100
- Valid bid >= 5100
- Invalid bid 5050 returns 400 error

**Create Auction with Custom Increment**:
```bash
curl -X POST http://localhost:5000/auctions \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "product_id": 1,
    "start_price": 5000,
    "duration_minutes": 5,
    "minimum_increment": 200
  }'
```

**Error Response**:
```json
{
  "error": "Bid must be at least 5100...",
  "minimum_required_bid": 5100
}
```

---

### 3. Live Auction Countdown Timer

All auction responses include time_remaining_seconds field.
This is calculated dynamically: max(0, (end_time - now) / 1000)

**GET /auctions/:id Response**:
```json
{
  "auction": {
    "id": 1,
    "current_price": 6000,
    "time_remaining_seconds": 120,
    "minimum_increment": 100,
    "end_time": "2026-03-10T18:30:00Z"
  }
}
```

**GET /auctions Response**:
```json
[
  {
    "id": 1,
    "current_price": 6000,
    "time_remaining_seconds": 120
  },
  {
    "id": 2,
    "current_price": 3500,
    "time_remaining_seconds": 45
  }
]
```

---

### 4. Bid History API

New endpoint: GET /auctions/:id/bids

Returns complete bid history with bidder names, ordered chronologically.

**Response**:
```json
{
  "auction_id": 1,
  "total_bids": 5,
  "bid_history": [
    {
      "id": 1,
      "bidder_name": "John",
      "bid_amount": 5500,
      "created_at": "2026-03-10T10:00:00Z",
      "bidder_id": 2
    },
    {
      "id": 2,
      "bidder_name": "Jane",
      "bid_amount": 5800,
      "created_at": "2026-03-10T10:01:00Z",
      "bidder_id": 3
    }
  ]
}
```

**Test**:
```bash
curl http://localhost:5000/auctions/1/bids
```

---

## API Endpoints

### Updated

POST /auctions
- Add optional: minimum_increment (default 100)

GET /auctions
- Each auction includes: time_remaining_seconds

GET /auctions/:id
- Auction includes: time_remaining_seconds, minimum_increment

POST /auctions/:id/bid
- Validates: bid >= current_price + minimum_increment
- Returns: auction_extended flag
- Broadcasts: auctionExtended event

### New

GET /auctions/:id/bids
- Full bid history with bidder names
- Chronological order
- No authentication required

---

## Test Flow

### Anti-Sniping Test
1. Create auction (2 minute duration)
2. Wait 90 seconds
3. Place bid
4. Check response: auction_extended = true
5. Verify end_time increased

### Minimum Increment Test
1. Create auction with minimum_increment = 100, current_price = 5000
2. Try placing bid of 5050
3. Should get 400 error
4. Place bid of 5100
5. Should succeed

### Countdown Timer Test
1. GET /auctions/:id (note time_remaining_seconds = X)
2. Wait 5 seconds
3. GET /auctions/:id again
4. Verify time_remaining_seconds decreased by ~5

### Bid History Test
1. Place multiple bids
2. GET /auctions/:id/bids
3. Verify all bids listed
4. Verify bidder names correct
5. Verify chronological order

---

## Database Change

Schema updated: Added minimum_increment to auctions table
- Default value: 100
- Check constraint: > 0
- Existing auctions get default value

---

## Files Modified

1. database/schema.sql
   - Added minimum_increment column to auctions

2. backend/src/models/auctionModel.js
   - Updated createAuction to handle minimum_increment
   - Added extendAuctionEndTime function
   - Added calculateTimeRemaining function

3. backend/src/models/bidModel.js
   - Added getBidHistoryWithBidders function

4. backend/src/controllers/auctionController.js
   - Updated createAuction validation
   - Updated getAuctionById with time_remaining
   - Updated getAuctions with time_remaining
   - Enhanced placeBid with anti-sniping and increment validation
   - Added getBidHistory function

5. backend/src/routes/auctionRoutes.js
   - Added GET /:id/bids route

---

## Error Codes

400 - Minimum increment violation
400 - Invalid auction creation
404 - Auction not found
403 - Unauthorized (not auction owner)

