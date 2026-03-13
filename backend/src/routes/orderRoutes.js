const express = require("express");
const orderController = require("../controllers/orderController");
const { authMiddleware, roleAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", authMiddleware, orderController.createOrder);
router.get("/", authMiddleware, orderController.getOrders);
router.get("/buyer/:buyerId", authMiddleware, orderController.getBuyerOrders);
router.get("/farmer/:farmerId", authMiddleware, orderController.getFarmerOrders);
router.post("/auction-pay", authMiddleware, orderController.auctionPay);
router.get("/:id", authMiddleware, orderController.getOrderById);
router.post("/:id/pay", authMiddleware, orderController.simulatePayment);
router.patch("/:id/status", authMiddleware, roleAdmin, orderController.updateOrderStatus);

module.exports = router;
