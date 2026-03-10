const express = require("express");
const auctionController = require("../controllers/auctionController");
const { authMiddleware, roleFarmer } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", authMiddleware, roleFarmer, auctionController.createAuction);
router.get("/", auctionController.getAuctions);
router.get("/:id", auctionController.getAuctionById);
router.post("/:id/bid", authMiddleware, auctionController.placeBid);

module.exports = router;
