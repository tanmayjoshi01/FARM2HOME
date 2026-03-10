# Testing Advanced Auction Features

## Test 1: Anti-Sniping Extension

Creates auction with 3 minute duration and verifies it extends on late bids.

```bash
# Setup: Register and create product (see QUICK_START.md)
# Then wait 2.5 minutes, place bid in final 30 seconds

curl -X POST http://localhost:5000/auctions/$AUCTION_ID/bid \
  -H "Authorization: Bearer $BUYER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"bid_amount": 5100}'

# Response should include:
# "auction_extended": true
# end_time should increase by 30 seconds
```

VERIFY:
- Response has "auction_extended": true
- end_time is 30 seconds later
- time_remaining_seconds recalculated

---

## Test 2: Minimum Bid Increment

Test that bids below minimum increment are rejected.

```bash
# Get current auction
curl http://localhost:5000/auctions/$AUCTION_ID | jq '.auction.minimum_increment'

# Try bid too low (if minimum_increment=100, current=5000, need 5100+)
curl -X POST http://localhost:5000/auctions/$AUCTION_ID/bid \
  -H "Authorization: Bearer $BUYER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"bid_amount": 5050}'

# Should return 400 error:
# "Bid must be at least 5100..."

# Place valid bid
curl -X POST http://localhost:5000/auctions/$AUCTION_ID/bid \
  -H "Authorization: Bearer $BUYER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"bid_amount": 5100}'

# Should return 201 success
```

CREATE WITH CUSTOM INCREMENT:

```bash
curl -X POST http://localhost:5000/auctions \
  -H "Authorization: Bearer $FARMER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "product_id": 1,
    "start_price": 5000,
    "duration_minutes": 10,
    "minimum_increment": 500
  }'
```

VERIFY:
- Too-low bids rejected with 400
- Error includes minimum_required_bid
- Valid bids accepted
- Custom increment respected

---

## Test 3: Countdown Timer

Time remaining calculates dynamically.

```bash
# Get auction
curl http://localhost:5000/auctions/$AUCTION_ID | \
  jq '.auction.time_remaining_seconds'

# Wait 10 seconds
sleep 10

# Get again - should be approximately 10 seconds less
curl http://localhost:5000/auctions/$AUCTION_ID | \
  jq '.auction.time_remaining_seconds'
```

ALL AUCTIONS:

```bash
curl http://localhost:5000/auctions | \
  jq '.[] | {id, time_remaining_seconds}'
```

VERIFY:
- Field present on all auctions
- Value decreases over time
- Ends at 0 when auction ends

---

## Test 4: Bid History

Get full bid history with bidder names.

```bash
# Get bid history (no auth required)
curl http://localhost:5000/auctions/$AUCTION_ID/bids | jq '.'
```

EXPECTED:

```json
{
  "auction_id": 1,
  "total_bids": 3,
  "bid_history": [
    {
      "id": 1,
      "bidder_name": "Buyer1",
      "bid_amount": 5100,
      "created_at": "2026-03-10T10:00:00Z",
      "bidder_id": 2
    },
    {
      "id": 2,
      "bidder_name": "Buyer2",
      "bid_amount": 5200,
      "created_at": "2026-03-10T10:01:00Z",
      "bidder_id": 3
    }
  ]
}
```

VERIFY:
- total_bids correct
- All bids listed
- Chronological order
- Bidder names shown
- Can see bidding progression

---

## All Features Summary

Feature | Endpoint | Test
--- | --- | ---
Anti-Sniping | POST /auctions/:id/bid | Response has auction_extended=true
Minimum Increment | POST /auctions/:id/bid | Too-low bid returns 400 error
Countdown Timer | GET /auctions/:id | time_remaining_seconds field present
Countdown Timer | GET /auctions | Each auction has time_remaining
Bid History | GET /auctions/:id/bids | Lists all bids with bidder names

---

## Quick Test Commands

```bash
# Create auction with custom settings
curl -X POST http://localhost:5000/auctions \
  -H "Authorization: Bearer $FARMER_TOKEN" \
  -d '{"product_id":1,"start_price":5000,"duration_minutes":5,"minimum_increment":100}'

# Place bid
curl -X POST http://localhost:5000/auctions/1/bid \
  -H "Authorization: Bearer $BUYER_TOKEN" \
  -d '{"bid_amount":5100}'

# Get auction with timer
curl http://localhost:5000/auctions/1 | jq '.auction.time_remaining_seconds'

# Get bid history
curl http://localhost:5000/auctions/1/bids
```

