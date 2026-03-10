const orderModel = require("../models/orderModel");
const auctionModel = require("../models/auctionModel");
const productModel = require("../models/productModel");

async function createOrder(req, res) {
  try {
    const { product_id, quantity, auction_id } = req.body;
    const user_id = req.user.id;

    if (!product_id || !quantity) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const product = await productModel.getProductById(product_id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    if (product.stock < quantity) {
      return res.status(400).json({ error: "Insufficient stock" });
    }

    const total_price = product.price_cents * quantity;

    const order = await orderModel.createOrder(user_id, product_id, auction_id || null, quantity, total_price);

    res.status(201).json({
      message: "Order created successfully",
      order,
    });
  } catch (error) {
    console.error("Create order error:", error);
    res.status(500).json({ error: "Failed to create order" });
  }
}

async function getOrderById(req, res) {
  try {
    const { id } = req.params;
    const order = await orderModel.getOrderById(id);

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.json(order);
  } catch (error) {
    console.error("Get order error:", error);
    res.status(500).json({ error: "Failed to fetch order" });
  }
}

async function getOrders(req, res) {
  try {
    const user_id = req.user?.id;

    if (user_id) {
      const orders = await orderModel.getOrdersByUser(user_id);
      return res.json(orders);
    }

    const orders = await orderModel.getAllOrders();
    res.json(orders);
  } catch (error) {
    console.error("Get orders error:", error);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
}

async function simulatePayment(req, res) {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    const order = await orderModel.getOrderById(id);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    if (order.user_id !== user_id) {
      return res.status(403).json({ error: "You can only pay for your own orders" });
    }

    if (order.status !== "pending") {
      return res.status(400).json({ error: "Order is not pending" });
    }

    const updated = await orderModel.updateOrderStatus(id, "paid");

    res.json({
      message: "Payment simulated successfully",
      order: updated,
    });
  } catch (error) {
    console.error("Payment error:", error);
    res.status(500).json({ error: "Payment failed" });
  }
}

async function updateOrderStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["pending", "paid", "shipped", "delivered"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const order = await orderModel.getOrderById(id);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    const updated = await orderModel.updateOrderStatus(id, status);

    res.json({
      message: "Order status updated successfully",
      order: updated,
    });
  } catch (error) {
    console.error("Update order status error:", error);
    res.status(500).json({ error: "Failed to update order status" });
  }
}

module.exports = {
  createOrder,
  getOrderById,
  getOrders,
  simulatePayment,
  updateOrderStatus,
};
