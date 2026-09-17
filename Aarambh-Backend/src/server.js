import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import { connectDB } from './config/db.js';

const PORT = process.env.PORT || 5000;

// Connect to Database
connectDB();

// Start Server
const server = app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  console.log(`📚 Swagger Docs available at http://localhost:${PORT}/api-docs`);
  console.log(`====================================================`);
});

// Unhandled Promise Rejections Handler
process.on('unhandledRejection', (err) => {
  console.error(`[Unhandled Rejection Error]: ${err.message}`);
  server.close(() => {
    process.exit(1);
  });
});

// Uncaught Exceptions Handler
process.on('uncaughtException', (err) => {
  console.error(`[Uncaught Exception Error]: ${err.message}`);
  process.exit(1);
});
