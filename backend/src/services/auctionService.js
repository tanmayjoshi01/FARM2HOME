const auctionModel = require("../models/auctionModel");
const bidModel = require("../models/bidModel");

async function closeExpiredAuctions() {
  const auctions = await auctionModel.getActiveAuctions();

  for (const auction of auctions) {
    if (new Date() > new Date(auction.end_time)) {
      const highestBid = await bidModel.getHighestBid(auction.id);
      const winner_id = highestBid ? highestBid.user_id : null;

      await auctionModel.endAuction(auction.id, winner_id);
    }
  }
}

module.exports = {
  closeExpiredAuctions,
};
