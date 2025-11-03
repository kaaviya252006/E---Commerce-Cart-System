const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Coupon = require('../models/Coupon');
const { protect } = require('../middleware/auth');

// POST /checkout
// body: { address }
router.post('/', protect, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product').populate('coupon').session(session);
    if (!cart || cart.items.length === 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // inventory checks and reserve/decrement inventory
    for (const it of cart.items) {
      const product = await Product.findById(it.product._id).session(session).exec();
      if (!product) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ message: `Product ${it.product._id} not found` });
      }
      if (product.inventory < it.quantity) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ message: `Insufficient inventory for ${product.title}` });
      }
      product.inventory -= it.quantity;
      await product.save({ session });
    }

    // compute totals
    let subtotal = 0;
    const orderItems = cart.items.map(it => {
      const price = it.priceAtAdd ?? it.product.price;
      subtotal += price * it.quantity;
      return {
        product: it.product._id,
        quantity: it.quantity,
        price
      };
    });

    // coupon
    let discount = 0;
    if (cart.coupon) {
      const coupon = await Coupon.findById(cart.coupon._id).session(session);
      if (!coupon || !coupon.isValid()) {
        // ignore coupon if invalid
      } else {
        if (coupon.type === 'percent') {
          discount = (coupon.value / 100) * subtotal;
        } else {
          discount = coupon.value;
        }
        coupon.usedCount = (coupon.usedCount || 0) + 1;
        await coupon.save({ session });
      }
    }

    const total = Math.max(0, subtotal - discount);
    const order = await Order.create([{
      user: req.user._id,
      items: orderItems,
      subtotal,
      discount,
      total,
      address: req.body.address || ''
    }], { session });

    // clear cart
    cart.items = [];
    cart.coupon = null;
    await cart.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.json({ message: 'Order placed', order: order[0] });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error(err);
    res.status(500).json({ message: 'Checkout failed', error: err.message });
  }
});

module.exports = router;
