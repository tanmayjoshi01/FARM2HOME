const Razorpay = require("razorpay");

// Intentionally let the app crash if keys are missing in production
// so we don't accidentally run a payment flow without API keys
if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  console.warn("⚠️ RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET is not set in environment variables.");
}

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "RAZORPAY_KEY_MISSING",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "RAZORPAY_SECRET_MISSING",
});

module.exports = razorpay;
