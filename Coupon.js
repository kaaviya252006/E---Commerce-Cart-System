const mongoose = require('mongoose');

const CouponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  type: { type: String, enum: ['percent', 'fixed'], default: 'percent' },
  value: { type: Number, required: true }, // percent or fixed amount
  expiresAt: Date,
  usageLimit: Number, // optional
  usedCount: { type: Number, default: 0 }
}, { timestamps: true });

CouponSchema.methods.isValid = function () {
  if (this.expiresAt && new Date() > this.expiresAt) return false;
  if (this.usageLimit && this.usedCount >= this.usageLimit) return false;
  return true;
};

module.exports = mongoose.model('Coupon', CouponSchema);
