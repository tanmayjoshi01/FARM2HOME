const auctionModel = require("../models/auctionModel");
const bidModel = require("../models/bidModel");
const productModel = require("../models/productModel");
const { pool } = require("../config/db");

async function createAuction(req, res) {
  try {
    const { product_id, start_price, duration_minutes, minimum_increment = 100 } = req.body;
    const user_id = req.user.id;

    if (!product_id || start_price === undefined || !duration_minutes) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (minimum_increment <= 0) {
      return res.status(400).json({ error: "Minimum increment must be greater than 0" });
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

    const auction = await auctionModel.createAuction(product_id, start_price, start_time, end_time, minimum_increment);

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

    // Calculate time remaining in seconds
    const time_remaining_seconds = auctionModel.calculateTimeRemaining(auction.end_time);

    res.json({
      auction: {
        ...auction,
        time_remaining_seconds,
      },
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

    // Add time_remaining_seconds to each auction
    const auctionsWithTimer = auctions.map(auction => ({
      ...auction,
      time_remaining_seconds: auctionModel.calculateTimeRemaining(auction.end_time),
    }));

    res.json(auctionsWithTimer);
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

    const now = new Date();
    const endTime = new Date(auction.end_time);

    if (now > endTime) {
      return res.status(400).json({ error: "Auction has ended" });
    }

    // Validation 1: Bid must be higher than current price
    if (bid_amount <= auction.current_price) {
      return res.status(400).json({ error: "Bid must be higher than current price" });
    }

    // Validation 2: Bid must meet minimum increment requirement
    const minimum_required_bid = auction.current_price + auction.minimum_increment;
    if (bid_amount < minimum_required_bid) {
      return res.status(400).json({
        error: `Bid must be at least ${minimum_required_bid} (current price ${auction.current_price} + minimum increment ${auction.minimum_increment})`,
        minimum_required_bid,
      });
    }

    // Feature: Anti-sniping - Check if bid is within last 30 seconds
    const timeRemaining = auctionModel.calculateTimeRemaining(auction.end_time);
    let auctionExtended = false;

    if (timeRemaining <= 30) {
      // Extend auction by 30 seconds
      const extensionSeconds = 30;
      await auctionModel.extendAuctionEndTime(id, extensionSeconds);
      auctionExtended = true;

      // Broadcast auction extension via Socket.io
      if (global.io) {
        global.io.to(`auction-${id}`).emit("auctionExtended", {
          auction_id: id,
          new_end_time: new Date(endTime.getTime() + extensionSeconds * 1000),
          extended_by_seconds: extensionSeconds,
        });
      }
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
      auction_extended: auctionExtended,
    });
  } catch (error) {
    console.error("Place bid error:", error);
    res.status(500).json({ error: "Failed to place bid" });
  }
}

// Feature: Get bid history for an auction
async function getBidHistory(req, res) {
  try {
    const { id } = req.params;

    // Verify auction exists
    const auction = await auctionModel.getAuctionById(id);
    if (!auction) {
      return res.status(404).json({ error: "Auction not found" });
    }

    // Get bid history with bidder names
    const bidHistory = await bidModel.getBidHistoryWithBidders(id);

    res.json({
      auction_id: id,
      total_bids: bidHistory.length,
      bid_history: bidHistory,
    });
  } catch (error) {
    console.error("Get bid history error:", error);
    res.status(500).json({ error: "Failed to fetch bid history" });
  }
}

module.exports = {
  createAuction,
  getAuctionById,
  getAuctions,
  placeBid,
  getBidHistory,
};
