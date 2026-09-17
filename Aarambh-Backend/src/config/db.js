import mongoose from 'mongoose';
import { ApiError } from '../utils/ApiError.js';
import { HTTP_STATUS, MESSAGES } from '../constants/app.constants.js';
import { User } from '../models/user.model.js';
import { seedDatabase } from '../seeders/aarambh.seeder.js';

// Disable buffering so Mongoose fails fast if DB is not connected
mongoose.set('bufferCommands', false);

/**
 * Connect to MongoDB database & auto-seed if empty
 */
export const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/aarambh_db';
    const conn = await mongoose.connect(uri, {
      autoIndex: true,
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);

    // Auto-seed if database has zero users
    const userCount = await User.countDocuments();
    if (userCount === 0 || process.env.AUTO_SEED === 'true') {
      console.log('[Database Auto-Seed] Database is empty. Running automatic initial seeder...');
      await seedDatabase();
    }
  } catch (error) {
    console.error(`[Database Error] Connection failed: ${error.message}`);
    console.error(`[Database Warning] Please start local MongoDB or update MONGODB_URI in .env file.`);
  }
};

/**
 * Middleware to check if MongoDB connection is active before processing DB routes
 */
export const checkDbConnection = (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return next(new ApiError(HTTP_STATUS.SERVICE_UNAVAILABLE, MESSAGES.DB_UNAVAILABLE));
  }
  next();
};
