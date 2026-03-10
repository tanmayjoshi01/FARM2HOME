# FARM2HOME Backend - Quick Start

## ONE-TIME SETUP

### Step 1: Install PostgreSQL
Download from: https://www.postgresql.org/download/

### Step 2: Create Database
```bash
createdb farm2home
```

### Step 3: Clone & Setup Backend
```bash
cd backend
npm install
```

### Step 4: Configure Environment
Copy `.env.example` to `.env` and update:
```bash
cp .env.example .env
```

Edit `.env`:
```
DATABASE_URL=postgresql://your_user:your_password@localhost:5432/farm2home
JWT_SECRET=any_random_string_here
PORT=5000
```

### Step 5: Initialize Database Schema
```bash
psql -U your_user -d farm2home -f ../database/schema.sql
```

### Step 6: Start Server
```bash
npm run dev
```

Expected output:
```
Backend listening on http://localhost:5000
PostgreSQL connected successfully
```

---

## VERIFY IT'S WORKING

### Check Health
```bash
curl http://localhost:5000/health
```

Should return: `{"ok":true}`

---

## RUN FULL TEST (Copy-Paste These)

### 1. Register Farmer
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
Save the `id` from response.

### 2. Register Buyer
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

### 3. Login Farmer (Get Token)
```bash
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "farmer@example.com",
    "password": "password123"
  }'
```
Copy the `token` value. Replace `$FARMER_TOKEN` below with this token.

### 4. Create Product
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
Save the `id` from response as `$PRODUCT_ID`.

### 5. Start Auction
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
Save the `id` as `$AUCTION_ID`.

### 6. Get All Products
```bash
curl http://localhost:5000/products
```

### 7. Get Auction Details
```bash
curl http://localhost:5000/auctions/$AUCTION_ID
```

### 8. Login Buyer (Get Token)
```bash
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "buyer@example.com",
    "password": "password123"
  }'
```
Copy token as `$BUYER_TOKEN`.

### 9. Place Bid
```bash
curl -X POST http://localhost:5000/auctions/$AUCTION_ID/bid \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $BUYER_TOKEN" \
  -d '{
    "bid_amount": 5500
  }'
```

### 10. Place Higher Bid
```bash
curl -X POST http://localhost:5000/auctions/$AUCTION_ID/bid \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $BUYER_TOKEN" \
  -d '{
    "bid_amount": 6000
  }'
```

### 11. Wait 5 Minutes or Check Auction
```bash
curl http://localhost:5000/auctions/$AUCTION_ID
```
Check `status` field - should be `ended` after duration.

### 12. Create Order
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
Save `id` as `$ORDER_ID`.

### 13. Simulate Payment
```bash
curl -X POST http://localhost:5000/orders/$ORDER_ID/pay \
  -H "Authorization: Bearer $BUYER_TOKEN"
```
Status should change to `paid`.

### 14. Register Admin
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

### 15. Login Admin (Get Token)
```bash
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "password123"
  }'
```
Copy token as `$ADMIN_TOKEN`.

### 16. Update Order to Shipped
```bash
curl -X PATCH http://localhost:5000/orders/$ORDER_ID/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "status": "shipped"
  }'
```

### 17. Update Order to Delivered
```bash
curl -X PATCH http://localhost:5000/orders/$ORDER_ID/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "status": "delivered"
  }'
```

---

## POSTMAN IMPORT

Use `TESTING_GUIDE.md` for all endpoints or import into Postman.

---

## TROUBLESHOOTING

### Issue: DATABASE_URL is not set
**Fix:** Create `.env` file in backend folder with correct PostgreSQL URL.

### Issue: Failed to connect to PostgreSQL
**Fix:** 
- Check if PostgreSQL is running
- Verify DATABASE_URL in .env
- Check username and password

### Issue: Token invalid
**Fix:** JWT_SECRET in .env must match across server restarts

### Issue: Port 5000 already in use
**Fix:** Change PORT in .env to different number (e.g., 5001)

---

## PROJECT STRUCTURE

```
backend/
├── src/
│   ├── config/
│   │   ├── db.js           (Database connection)
│   │   └── env.js          (Environment variables)
│   ├── models/             (Database queries)
│   │   ├── userModel.js
│   │   ├── productModel.js
│   │   ├── auctionModel.js
│   │   ├── bidModel.js
│   │   └── orderModel.js
│   ├── controllers/        (Logic)
│   │   ├── authController.js
│   │   ├── productController.js
│   │   ├── auctionController.js
│   │   └── orderController.js
│   ├── routes/             (API endpoints)
│   │   ├── authRoutes.js
│   │   ├── productRoutes.js
│   │   ├── auctionRoutes.js
│   │   └── orderRoutes.js
│   ├── middleware/         (Authentication)
│   │   └── authMiddleware.js
│   ├── services/           (Business logic)
│   │   └── auctionService.js
│   ├── utils/
│   │   └── jwt.js          (JWT utilities)
│   └── app.js              (Main express app)
├── package.json
├── .env.example
└── run-server.sh
```

