require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const connectDB = require('./config/db');

const authRoutes = require('./routes/auth');
const productsRoutes = require('./routes/products');
const cartRoutes = require('./routes/cart');
const checkoutRoutes = require('./routes/checkout');
const couponsRoutes = require('./routes/coupons');

const app = express();
app.use(cors());
app.use(bodyParser.json());

connectDB(process.env.MONGO_URI || 'mongodb://localhost:27017/ecommerce');

app.use('/api/auth', authRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/checkout', checkoutRoutes);
app.use('/api/coupons', couponsRoutes);

app.get('/', (req, res) => res.send('E-commerce API running'));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
