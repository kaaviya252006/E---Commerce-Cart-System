require('dotenv').config();
const connectDB = require('../config/db');
const Product = require('../models/Product');
const User = require('../models/User');
const Coupon = require('../models/Coupon');

const run = async () => {
  await connectDB(process.env.MONGO_URI);
  await Product.deleteMany({});
  await User.deleteMany({});
  await Coupon.deleteMany({});

  const products = await Product.insertMany([
    { title: 'T-shirt', description: 'Comfort tee', price: 499, inventory: 50 },
    { title: 'Sneakers', description: 'Running shoes', price: 2499, inventory: 20 },
    { title: 'Mug', description: 'Coffee mug', price: 199, inventory: 100 },
  ]);
  console.log('Products seeded', products);

  const user = await User.create({ name: 'Demo User', email: 'demo@example.com', password: 'password123' });
  console.log('User seeded:', user.email);

  const coupon = await Coupon.create({ code: 'WELCOME10', type: 'percent', value: 10, expiresAt: new Date(Date.now() + 1000*60*60*24*30) });
  console.log('Coupon seeded:', coupon.code);

  process.exit(0);
};
run().catch(err => { console.error(err); process.exit(1); });
