import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './models/db.js';

import userRoutes from './routes/user.routs.js';
import productRoutes from './routes/product.routes.js';
import sellerRoutes from './routes/Seller.routes.js';
import authRoutes from './routes/authRoutes.js';
import cartRoutes from "./routes/Cart.routes.js";
import orderRoutes from './routes/order.routes.js';

import sellerAuthRoutes from './routes/sellerAuthRoutes.js';
import sellerProductRoutes from './routes/sellerProductRoutes.js';
import sellerOrderRoutes from './routes/sellerOrderRoutes.js';
import sellerAnalyticsRoutes from './routes/sellerAnalyticsRoutes.js';
import sellerNotificationRoutes from './routes/sellerNotificationRoutes.js';
import razorpayRoutes from './routes/razorpay.js';
import sellerAuthRoutes from './routes/sellerAuthRoutes.js';

import reviewRoutes from './routes/review.routes.js';




dotenv.config();
const app = express();

app.use(express.json());
app.use(cors());

app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use("/api/sellers", sellerRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);

app.use("/api/sellers/auth", sellerAuthRoutes);
app.use("/api/sellers/products", sellerProductRoutes);
app.use("/api/sellers/orders", sellerOrderRoutes);
app.use("/api/sellers/analytics", sellerAnalyticsRoutes);
app.use("/api/sellers/notifications", sellerNotificationRoutes);

app.use('/api/razorpay', razorpayRoutes);
app.use('/api/sellers/auth', sellerAuthRoutes);
app.use('/api/reviews', reviewRoutes);


app.get('/', (req, res) => {
    res.send('Hello duniyaa');
});

connectDB();

export default app;
