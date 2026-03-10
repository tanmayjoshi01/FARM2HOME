const auctionModel = require("../models/auctionModel");
const bidModel = require("../models/bidModel");
const productModel = require("../models/productModel");
const { pool } = require("../config/db");

async function createAuction(req, res) {
  try {
    const { product_id, start_price, duration_minutes } = req.body;
    const user_id = req.user.id;

    if (!product_id || start_price === undefined || !duration_minutes) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const product = await productModel.getProductById(product_id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    if (product.farmer_id !== user_id) {
      return res.status(403).json({ error: "You can only auction your own products" });
    }

    const start_time = new Date();
    const end_time = new Date(start_time.getTime() + duration_minutes * 60000);

    const auction = await auctionModel.createAuction(product_id, start_price, start_time, end_time);

    res.status(201).json({
      message: "Auction created successfully",
      auction,
    });
  } catch (error) {
    console.error("Create auction error:", error);
    res.status(500).json({ error: "Failed to create auction" });
  }
}

async function getAuctionById(req, res) {
  try {
    const { id } = req.params;
    const auction = await auctionModel.getAuctionById(id);

    if (!auction) {
      return res.status(404).json({ error: "Auction not found" });
    }

    const bids = await bidModel.getBidsByAuction(id);

    res.json({
      auction,
      bids,
    });
  } catch (error) {
    console.error("Get auction error:", error);
    res.status(500).json({ error: "Failed to fetch auction" });
  }
}

async function getAuctions(req, res) {
  try {
    const auctions = await auctionModel.getAllAuctions();
    res.json(auctions);
  } catch (error) {
    console.error("Get auctions error:", error);
    res.status(500).json({ error: "Failed to fetch auctions" });
  }
}

async function placeBid(req, res) {
  try {
    const { id } = req.params;
    const { bid_amount } = req.body;
    const user_id = req.user.id;

    if (!bid_amount) {
      return res.status(400).json({ error: "Bid amount required" });
    }

    const auction = await auctionModel.getAuctionById(id);
    if (!auction) {
      return res.status(404).json({ error: "Auction not found" });
    }

    if (auction.status !== "active") {
      return res.status(400).json({ error: "Auction is not active" });
    }

    if (new Date() > new Date(auction.end_time)) {
      return res.status(400).json({ error: "Auction has ended" });
    }

    if (bid_amount <= auction.current_price) {
      return res.status(400).json({ error: "Bid must be higher than current price" });
    }

    const bid = await bidModel.placeBid(id, user_id, bid_amount);
    await auctionModel.updateCurrentPrice(id, bid_amount, user_id);

    // Broadcast bid update via Socket.io
    if (global.broadcastBidUpdate) {
      const user = await pool.query("SELECT name FROM users WHERE id = $1", [user_id]);
      global.broadcastBidUpdate(id, bid_amount, user.rows[0]?.name || "Unknown");
    }

    res.status(201).json({
      message: "Bid placed successfully",
      bid,
    });
  } catch (error) {
    console.error("Place bid error:", error);
    res.status(500).json({ error: "Failed to place bid" });
  }
}

module.exports = {
  createAuction,
  getAuctionById,
  getAuctions,
  placeBid,
};
