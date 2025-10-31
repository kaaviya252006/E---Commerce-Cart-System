const mongoose = require('mongoose');

const CartItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true, min: 1 },
  priceAtAdd: { type: Number, required: true } // snapshot price
}, { _id: false });

const CartSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  items: [CartItemSchema],
  coupon: { type: mongoose.Schema.Types.ObjectId, ref: 'Coupon', default: null },
}, { timestamps: true });

module.exports = mongoose.model('Cart', CartSchema);
