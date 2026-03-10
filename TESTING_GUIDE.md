# FARM2HOME Backend - Testing Guide

## SETUP COMMANDS

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Setup Environment Variables (.env)
Create `.env` file in backend directory:
```
DATABASE_URL=postgresql://username:password@localhost:5432/farm2home
JWT_SECRET=your_secret_key_here
PORT=5000
```

### 3. Initialize Database
```bash
# Connect to PostgreSQL and run schema
psql -U username -d farm2home -f ../database/schema.sql
```

### 4. Start Server
```bash
# Development with auto-reload
npm run dev

# Production
npm start
```

Server runs on: `http://localhost:5000`

---

## TESTING FLOW (POSTMAN / CURL)

### 1. REGISTER USER (Farmer)
```bash
curl -X POST http://localhost:5000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Farmer",
    "email": "farmer@example.com",
    "password": "password123",
    "role": "farmer"
  }'
```
**Response:** Returns user object with id

---

### 2. REGISTER USER (Buyer)
```bash
curl -X POST http://localhost:5000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Buyer",
    "email": "buyer@example.com",
    "password": "password123",
    "role": "buyer"
  }'
```

---

### 3. LOGIN FARMER
```bash
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "farmer@example.com",
    "password": "password123"
  }'
```
**Save token from response as: `$FARMER_TOKEN`**

---

### 4. LOGIN BUYER
```bash
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "buyer@example.com",
    "password": "password123"
  }'
```
**Save token from response as: `$BUYER_TOKEN`**

---

### 5. CREATE PRODUCT (Farmer only)
```bash
curl -X POST http://localhost:5000/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $FARMER_TOKEN" \
  -d '{
    "name": "Fresh Tomatoes",
    "description": "Organic red tomatoes",
    "price_cents": 5000,
    "stock": 100
  }'
```
**Save product id from response as: `$PRODUCT_ID`**

---

### 6. GET ALL PRODUCTS
```bash
curl -X GET http://localhost:5000/products
```

---

### 7. GET SINGLE PRODUCT
```bash
curl -X GET http://localhost:5000/products/$PRODUCT_ID
```

---

### 8. UPDATE PRODUCT (Farmer only)
```bash
curl -X PUT http://localhost:5000/products/$PRODUCT_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $FARMER_TOKEN" \
  -d '{
    "name": "Fresh Tomatoes",
    "description": "Updated description",
    "price_cents": 6000,
    "stock": 90
  }'
```

---

### 9. START AUCTION (Farmer only)
```bash
curl -X POST http://localhost:5000/auctions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $FARMER_TOKEN" \
  -d '{
    "product_id": $PRODUCT_ID,
    "start_price": 5000,
    "duration_minutes": 5
  }'
```
**Save auction id from response as: `$AUCTION_ID`**

---

### 10. GET ALL AUCTIONS
```bash
curl -X GET http://localhost:5000/auctions
```

---

### 11. GET SINGLE AUCTION WITH BIDS
```bash
curl -X GET http://localhost:5000/auctions/$AUCTION_ID
```

---

### 12. PLACE BID (Buyer only)
```bash
curl -X POST http://localhost:5000/auctions/$AUCTION_ID/bid \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $BUYER_TOKEN" \
  -d '{
    "bid_amount": 5500
  }'
```

---

### 13. PLACE ANOTHER BID (Higher)
```bash
curl -X POST http://localhost:5000/auctions/$AUCTION_ID/bid \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $BUYER_TOKEN" \
  -d '{
    "bid_amount": 6000
  }'
```

---

### 14. WAIT FOR AUCTION TO END (or manually)
- Auctions auto-close after duration_minutes
- Check status with GET /auctions/$AUCTION_ID

---

### 15. CREATE ORDER (After auction ends)
```bash
curl -X POST http://localhost:5000/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $BUYER_TOKEN" \
  -d '{
    "product_id": $PRODUCT_ID,
    "quantity": 5,
    "auction_id": $AUCTION_ID
  }'
```
**Save order id from response as: `$ORDER_ID`**

---

### 16. GET ORDERS
```bash
curl -X GET http://localhost:5000/orders \
  -H "Authorization: Bearer $BUYER_TOKEN"
```

---

### 17. GET SINGLE ORDER
```bash
curl -X GET http://localhost:5000/orders/$ORDER_ID \
  -H "Authorization: Bearer $BUYER_TOKEN"
```

---

### 18. SIMULATE PAYMENT
```bash
curl -X POST http://localhost:5000/orders/$ORDER_ID/pay \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $BUYER_TOKEN"
```
**Order status should change to: `paid`**

---

### 19. REGISTER ADMIN USER
```bash
curl -X POST http://localhost:5000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@example.com",
    "password": "password123",
    "role": "admin"
  }'
```

---

### 20. LOGIN ADMIN
```bash
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "password123"
  }'
```
**Save token as: `$ADMIN_TOKEN`**

---

### 21. UPDATE DELIVERY STATUS (Admin only)
```bash
curl -X PATCH http://localhost:5000/orders/$ORDER_ID/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "status": "shipped"
  }'
```

---

### 22. UPDATE TO DELIVERED
```bash
curl -X PATCH http://localhost:5000/orders/$ORDER_ID/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "status": "delivered"
  }'
```

---

### 23. CHECK HEALTH
```bash
curl -X GET http://localhost:5000/health
```
**Response:** `{"ok":true}`

---

## EXPECTED FLOW SUMMARY

1. ✓ Register farmer
2. ✓ Register buyer
3. ✓ Login farmer (get token)
4. ✓ Login buyer (get token)
5. ✓ Create product (farmer)
6. ✓ Start auction (farmer)
7. ✓ Place bid (buyer)
8. ✓ Auction ends (auto or after duration)
9. ✓ Create order (buyer)
10. ✓ Simulate payment (buyer)
11. ✓ Update delivery (admin)

---

## ERROR CODES

- **400** - Bad request (missing fields)
- **401** - Unauthorized (invalid token)
- **403** - Forbidden (insufficient permissions)
- **404** - Not found
- **409** - Conflict (email already exists)
- **500** - Server error

---

## NOTES

- All prices in cents (divide by 100 for display)
- Auctions auto-close after duration_minutes expires
- Real-time bidding via WebSocket (Socket.io)
- Tokens expire in 1 hour
- Database must be PostgreSQL
