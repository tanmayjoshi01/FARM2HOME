# Farm2Home Backend - Commands Cheatsheet

## INSTALLATION & STARTUP (Run these ONCE)

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with PostgreSQL credentials
createdb farm2home
psql -U username -d farm2home -f ../database/schema.sql
npm run dev
```

Expected: "Backend listening on http://localhost:5000"

## SERVER VERIFICATION

```bash
curl http://localhost:5000/health
# Response: {"ok":true}
```

## COMPLETE TEST FLOW

### REGISTER FARMER
```bash
curl -X POST http://localhost:5000/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"John Farmer\",\"email\":\"farmer@test.com\",\"password\":\"pass123\",\"role\":\"farmer\"}"
```

### REGISTER BUYER
```bash
curl -X POST http://localhost:5000/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Jane Buyer\",\"email\":\"buyer@test.com\",\"password\":\"pass123\",\"role\":\"buyer\"}"
```

### REGISTER ADMIN
```bash
curl -X POST http://localhost:5000/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Admin\",\"email\":\"admin@test.com\",\"password\":\"pass123\",\"role\":\"admin\"}"
```

### LOGIN FARMER (Save token as FARMER_TOKEN)
```bash
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"farmer@test.com\",\"password\":\"pass123\"}"
```

### CREATE PRODUCT (Replace FARMER_TOKEN, save PRODUCT_ID)
```bash
curl -X POST http://localhost:5000/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer FARMER_TOKEN" \
  -d "{\"name\":\"Fresh Tomatoes\",\"description\":\"Red organic\",\"price_cents\":5000,\"stock\":100}"
```

### GET ALL PRODUCTS
```bash
curl http://localhost:5000/products
```

### LOGIN BUYER (Save token as BUYER_TOKEN)
```bash
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"buyer@test.com\",\"password\":\"pass123\"}"
```

### CREATE AUCTION (Replace FARMER_TOKEN and PRODUCT_ID, save AUCTION_ID)
```bash
curl -X POST http://localhost:5000/auctions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer FARMER_TOKEN" \
  -d "{\"product_id\":PRODUCT_ID,\"start_price\":5000,\"duration_minutes\":5}"
```

### GET AUCTION
```bash
curl http://localhost:5000/auctions/AUCTION_ID
```

### PLACE BID (Replace BUYER_TOKEN and AUCTION_ID)
```bash
curl -X POST http://localhost:5000/auctions/AUCTION_ID/bid \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer BUYER_TOKEN" \
  -d "{\"bid_amount\":5500}"
```

### PLACE HIGHER BID
```bash
curl -X POST http://localhost:5000/auctions/AUCTION_ID/bid \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer BUYER_TOKEN" \
  -d "{\"bid_amount\":6000}"
```

### CREATE ORDER (Replace BUYER_TOKEN, PRODUCT_ID, AUCTION_ID, save ORDER_ID)
```bash
curl -X POST http://localhost:5000/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer BUYER_TOKEN" \
  -d "{\"product_id\":PRODUCT_ID,\"quantity\":5,\"auction_id\":AUCTION_ID}"
```

### GET ORDERS
```bash
curl http://localhost:5000/orders \
  -H "Authorization: Bearer BUYER_TOKEN"
```

### SIMULATE PAYMENT (Replace BUYER_TOKEN and ORDER_ID)
```bash
curl -X POST http://localhost:5000/orders/ORDER_ID/pay \
  -H "Authorization: Bearer BUYER_TOKEN"
```

### LOGIN ADMIN (Save token as ADMIN_TOKEN)
```bash
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"admin@test.com\",\"password\":\"pass123\"}"
```

### UPDATE TO SHIPPED (Replace ADMIN_TOKEN and ORDER_ID)
```bash
curl -X PATCH http://localhost:5000/orders/ORDER_ID/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d "{\"status\":\"shipped\"}"
```

### UPDATE TO DELIVERED
```bash
curl -X PATCH http://localhost:5000/orders/ORDER_ID/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d "{\"status\":\"delivered\"}"
```

## ENDPOINT SUMMARY

| Method | Path | Auth | Role |
|--------|------|------|------|
| POST | /auth/register | No | - |
| POST | /auth/login | No | - |
| POST | /products | Yes | farmer |
| GET | /products | No | - |
| GET | /products/:id | No | - |
| PUT | /products/:id | Yes | farmer |
| DELETE | /products/:id | Yes | farmer |
| POST | /auctions | Yes | farmer |
| GET | /auctions | No | - |
| GET | /auctions/:id | No | - |
| POST | /auctions/:id/bid | Yes | - |
| POST | /orders | Yes | - |
| GET | /orders | Yes | - |
| GET | /orders/:id | Yes | - |
| POST | /orders/:id/pay | Yes | - |
| PATCH | /orders/:id/status | Yes | admin |
| GET | /health | No | - |

