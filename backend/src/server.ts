import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { getDatabase } from './db.js';

import authRouter from './routes/auth.js';
import productsRouter from './routes/products.js';
import ordersRouter from './routes/orders.js';
import paymentsRouter from './routes/payments.js';
import customersRouter from './routes/customers.js';
import instagramRouter from './routes/instagram.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS (Allow request origin dynamically to support localhost, 127.0.0.1, and dev ports)
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, postman) or any origin in dev
    callback(null, true);
  },
  credentials: true
}));

// Body Parsers
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Register routes
app.use('/api/auth', authRouter);
app.use('/api/products', productsRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/payments', paymentsRouter);
app.use('/api/customers', customersRouter);
app.use('/api/instagram', instagramRouter);

// Basic health check route
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

// Initialize DB and start server
async function startServer() {
  try {
    console.log('Connecting to database...');
    await getDatabase();
    console.log('Database connected and initialized.');
    
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
