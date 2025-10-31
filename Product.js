const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  inventory: { type: Number, default: 0 }, // quantity in stock
  sku: String,
  image: String,
}, { timestamps: true });

module.exports = mongoose.model('Product', ProductSchema);
