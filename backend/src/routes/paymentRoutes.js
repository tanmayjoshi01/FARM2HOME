const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const razorpay = require('../config/razorpay');
const { pool } = require('../config/db');
const { verifyToken } = require('../utils/jwt');

// POST /payment/create-order
router.post('/create-order', verifyToken, async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount) {
      return res.status(400).json({ error: 'Amount is required' });
    }

    const options = {
      amount: parseInt(amount, 10), // amount in the smallest currency unit (paise)
      currency: 'INR',
      receipt: `receipt_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    };

    const order = await razorpay.orders.create(options);
    
    // Return standard Razorpay order format
    res.json(order);
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    res.status(500).json({ error: 'Failed to create payment order' });
  }
});

// POST /payment/verify
router.post('/verify', verifyToken, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, order_db_id } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !order_db_id) {
      return res.status(400).json({ error: 'Missing payment verification data' });
    }

    // Creating our own signature checking
    const generated_signature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + '|' + razorpay_payment_id)
      .digest('hex');

    if (generated_signature !== razorpay_signature) {
      return res.status(400).json({ error: 'Invalid payment signature' });
    }

    // If signature is valid, update order in our DB
    const updateRes = await pool.query(
      `UPDATE orders 
       SET payment_status = 'paid', transaction_id = $1 
       WHERE id = $2 RETURNING id`,
      [razorpay_payment_id, order_db_id]
    );

    if (updateRes.rowCount === 0) {
      return res.status(404).json({ error: 'Order not found in database' });
    }

    res.json({ success: true, message: 'Payment verified successfully' });
  } catch (error) {
    console.error('Error verifying Razorpay payment:', error);
    res.status(500).json({ error: 'Payment verification failed' });
  }
});

module.exports = router;
