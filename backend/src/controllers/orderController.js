const orderModel = require("../models/orderModel");
const auctionModel = require("../models/auctionModel");
const productModel = require("../models/productModel");
const { pool } = require("../config/db");

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

    const amount = product.price_cents * quantity;
    const farmer_id = product.farmer_id;

    const order = await orderModel.createOrder(user_id, farmer_id, product_id, auction_id || null, quantity, amount);

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

async function getBuyerOrders(req, res) {
  try {
    const { buyerId } = req.params;
    
    // Ensure the requester is the buyer or an admin
    if (req.user.role !== 'admin' && Number(req.user.id) !== Number(buyerId)) {
      return res.status(403).json({ error: "Forbidden: You can only view your own orders" });
    }

    const query = `
      SELECT o.id as order_id, o.product_id, p.name as product_name,
             COALESCE(u.name, 'Unknown Farmer') as farmer_name,
             o.auction_id, o.amount, o.payment_status, o.transaction_id,
             o.created_at, o.quantity
      FROM orders o
      LEFT JOIN products p ON o.product_id = p.id
      LEFT JOIN users u ON o.farmer_id = u.id
      WHERE o.buyer_id = $1
      ORDER BY o.created_at DESC
    `;
    const result = await pool.query(query, [buyerId]);
    res.json(result.rows);
  } catch (error) {
    console.error("Get buyer orders error:", error);
    res.status(500).json({ error: "Failed to fetch buyer orders" });
  }
}

async function getFarmerOrders(req, res) {
  try {
    const { farmerId } = req.params;

    // Ensure the requester is the farmer or an admin
    if (req.user.role !== 'admin' && Number(req.user.id) !== Number(farmerId)) {
      return res.status(403).json({ error: "Forbidden: You can only view your own orders" });
    }

    const query = `
      SELECT o.id as order_id, p.name as product_name, u.name as buyer_name, 
             o.auction_id, o.amount as final_bid_amount, o.payment_status, o.created_at as order_date
      FROM orders o
      JOIN products p ON o.product_id = p.id
      JOIN users u ON o.buyer_id = u.id
      WHERE o.farmer_id = $1
      ORDER BY o.created_at DESC
    `;
    const result = await pool.query(query, [farmerId]);
    res.json(result.rows);
  } catch (error) {
    console.error("Get farmer orders error:", error);
    res.status(500).json({ error: "Failed to fetch farmer orders" });
  }
}

// Fallback: buyer pays for auction without a pre-existing pending order
async function auctionPay(req, res) {
  try {
    const { auction_id, product_id, transaction_id } = req.body;
    const buyer_id = req.user.id;

    if (!auction_id) {
      return res.status(400).json({ error: 'auction_id required' });
    }

    // Check if an order already exists for this auction
    const existing = await pool.query(
      'SELECT id FROM orders WHERE auction_id = $1',
      [auction_id]
    );

    let orderId;
    if (existing.rows.length > 0) {
      orderId = existing.rows[0].id;
      await pool.query(
        "UPDATE orders SET payment_status = 'paid', transaction_id = $1 WHERE id = $2",
        [transaction_id || null, orderId]
      );
    } else {
      // Create and immediately mark as paid
      const pRes = await pool.query('SELECT farmer_id, price_cents FROM products WHERE id = $1', [product_id]);
      if (!pRes.rows[0]) return res.status(404).json({ error: 'Product not found' });
      const { farmer_id } = pRes.rows[0];

      const aRes = await pool.query('SELECT current_price FROM auctions WHERE id = $1', [auction_id]);
      const amount = aRes.rows[0]?.current_price || pRes.rows[0].price_cents;

      const insertRes = await pool.query(
        "INSERT INTO orders (auction_id, product_id, buyer_id, farmer_id, amount, payment_status, transaction_id) VALUES ($1,$2,$3,$4,$5,'paid',$6) RETURNING id",
        [auction_id, product_id, buyer_id, farmer_id, amount, transaction_id || null]
      );
      orderId = insertRes.rows[0].id;
    }

    res.json({ order_id: orderId, payment_status: 'paid' });
  } catch (error) {
    console.error('Auction pay error:', error);
    res.status(500).json({ error: 'Auction payment failed' });
  }
}

async function simulatePayment(req, res) {
  try {
    const { id } = req.params;
    const user_id = req.user.id;
    const { transaction_id } = req.body || {};

    const orderRes = await pool.query('SELECT * FROM orders WHERE id = $1', [id]);
    const order = orderRes.rows[0];

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    if (order.buyer_id !== user_id) {
      return res.status(403).json({ error: "You can only pay for your own orders" });
    }

    if (order.payment_status !== "pending") {
      return res.status(400).json({ error: "Order is not pending" });
    }

    const txn = transaction_id || `TXN${Date.now()}`;
    const updatedRes = await pool.query(
      "UPDATE orders SET payment_status = 'paid', transaction_id = $1 WHERE id = $2 RETURNING *",
      [txn, id]
    );

    res.json({
      message: "Payment successful",
      order: updatedRes.rows[0],
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
  getBuyerOrders,
  getFarmerOrders,
  auctionPay,
  simulatePayment,
  updateOrderStatus,
};
