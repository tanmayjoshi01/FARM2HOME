const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const { createServer } = require("http");
const { Server } = require("socket.io");
const config = require("./config/env");
const { testConnection, pool } = require("./config/db");
const { verifyToken } = require("./utils/jwt");
const auctionService = require("./services/auctionService");

const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const auctionRoutes = require("./routes/auctionRoutes");
const orderRoutes = require("./routes/orderRoutes");
const disputeRoutes = require("./routes/disputeRoutes");

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
app.use("/uploads", express.static("uploads"));

// Routes
app.get("/health", (req, res) => {
  res.json({ ok: true });
});

app.use("/auth", authRoutes);
app.use("/products", productRoutes);
app.use("/auctions", auctionRoutes);
app.use("/orders", orderRoutes);
app.use("/disputes", disputeRoutes);

// Socket.io real-time bidding
io.on("connection", (socket) => {
  socket.on("joinAuction", (auctionId) => {
    socket.join(`auction-${auctionId}`);
  });

  socket.on("leaveAuction", (auctionId) => {
    socket.leave(`auction-${auctionId}`);
  });
});

function broadcastBidUpdate(auctionId, highestBid, bidder) {
  io.to(`auction-${auctionId}`).emit("bidUpdate", {
    auctionId,
    highestBid,
    bidder,
    timestamp: new Date(),
  });
}

function broadcastAuctionEnd(auctionId, winner) {
  io.to(`auction-${auctionId}`).emit("auctionEnded", {
    auctionId,
    winner,
    timestamp: new Date(),
  });
}

global.io = io;
global.broadcastBidUpdate = broadcastBidUpdate;
global.broadcastAuctionEnd = broadcastAuctionEnd;

// Check for expired auctions every minute
setInterval(async () => {
  try {
    const activeAuctions = await pool.query("SELECT * FROM auctions WHERE status = 'active'");
    for (const auction of activeAuctions.rows) {
      if (new Date() > new Date(auction.end_time)) {
        const bids = await pool.query("SELECT * FROM bids WHERE auction_id = $1 ORDER BY bid_amount DESC LIMIT 1", [auction.id]);
        const winner_id = bids.rows.length > 0 ? bids.rows[0].user_id : null;

        await pool.query("UPDATE auctions SET status = 'ended', winner_id = $1 WHERE id = $2", [winner_id, auction.id]);
        
        // Auto-create order if someone won
        if (winner_id) {
          // Check if order already exists to prevent duplicates
          const orderExists = await pool.query("SELECT id FROM orders WHERE auction_id = $1", [auction.id]);
          
          if (orderExists.rows.length === 0) {
            // Get product to find the farmer
            const product = await pool.query("SELECT farmer_id FROM products WHERE id = $1", [auction.product_id]);
            const farmer_id = product.rows[0]?.farmer_id;
            
            if (farmer_id) {
              await pool.query(
                "INSERT INTO orders (auction_id, product_id, buyer_id, farmer_id, amount, payment_status) VALUES ($1, $2, $3, $4, $5, 'pending')",
                [auction.id, auction.product_id, winner_id, farmer_id, auction.current_price]
              );
            }
          }
        }
        
        broadcastAuctionEnd(auction.id, winner_id);
      }
    }
  } catch (error) {
    console.error("Error checking expired auctions:", error);
  }
}, 60000);

async function start() {
  await testConnection();

  httpServer.listen(config.port, () => {
    console.log(`Backend listening on http://localhost:${config.port}`);
  });
}

start();
