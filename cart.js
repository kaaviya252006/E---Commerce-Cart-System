const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');

// get cart
router.get('/', protect, async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id }).populate('items.product').populate('coupon');
  if (!cart) return res.json({ user: req.user._id, items: [] });
  res.json(cart);
});

// add item to cart (POST /cart) body: { productId, quantity }
router.post('/', protect, async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    if (product.inventory < 1) return res.status(400).json({ message: 'Product out of stock' });

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = await Cart.create({
        user: req.user._id,
        items: [{ product: product._id, quantity: Math.min(quantity, product.inventory), priceAtAdd: product.price }]
      });
      return res.json(cart);
    }

    const idx = cart.items.findIndex(it => it.product.toString() === product._id.toString());
    if (idx > -1) {
      // increase quantity but not exceed inventory
      const newQty = Math.min(cart.items[idx].quantity + quantity, product.inventory);
      cart.items[idx].quantity = newQty;
      cart.items[idx].priceAtAdd = product.price;
    } else {
      cart.items.push({ product: product._id, quantity: Math.min(quantity, product.inventory), priceAtAdd: product.price });
    }
    await cart.save();
    await cart.populate('items.product').execPopulate?.();
    res.json(cart);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// modify quantity (PUT /cart) body: { productId, quantity }
router.put('/', protect, async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    if (!productId || !Number.isInteger(quantity) || quantity < 0) return res.status(400).json({ message: 'Invalid input' });

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    const idx = cart.items.findIndex(it => it.product.toString() === productId);
    if (idx === -1) return res.status(404).json({ message: 'Item not in cart' });

    if (quantity === 0) {
      cart.items.splice(idx, 1);
    } else {
      cart.items[idx].quantity = Math.min(quantity, product.inventory);
      cart.items[idx].priceAtAdd = product.price;
    }

    await cart.save();
    await cart.populate('items.product').execPopulate?.();
    res.json(cart);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// remove item (DELETE /cart/:productId)
router.delete('/:productId', protect, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });
    const idx = cart.items.findIndex(it => it.product.toString() === req.params.productId);
    if (idx === -1) return res.status(404).json({ message: 'Item not in cart' });
    cart.items.splice(idx, 1);
    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
