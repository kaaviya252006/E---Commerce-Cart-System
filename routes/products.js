const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// create product
router.post('/', async (req, res) => {
  try {
    const p = await Product.create(req.body);
    res.json(p);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// list
router.get('/', async (req, res) => {
  const products = await Product.find({});
  res.json(products);
});

// get single
router.get('/:id', async (req, res) => {
  const p = await Product.findById(req.params.id);
  if (!p) return res.status(404).json({ message: 'Product not found' });
  res.json(p);
});

// update (inventory management)
router.put('/:id', async (req, res) => {
  try {
    const p = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(p);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// delete
router.delete('/:id', async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.json({ message: 'deleted' });
});

module.exports = router;
