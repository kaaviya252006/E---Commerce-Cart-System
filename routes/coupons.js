const express = require('express');
const router = express.Router();
const Coupon = require('../models/Coupon');
const Cart = require('../models/Cart');
const { protect } = require('../middleware/auth');

// create coupon (admin)
router.post('/', async (req, res) => {
  try {
    const c = await Coupon.create(req.body);
    res.json(c);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// apply coupon to cart
router.post('/apply', protect, async (req, res) => {
  try {
    const { code } = req.body;
    const coupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (!coupon || !coupon.isValid()) return res.status(400).json({ message: 'Invalid coupon' });

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    cart.coupon = coupon._id;
    await cart.save();
    res.json({ message: 'Coupon applied', coupon });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
