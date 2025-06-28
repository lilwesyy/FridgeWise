const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/fridgewise';
    
    logger.info(`🔗 Attempting to connect to MongoDB: ${mongoURI.replace(/\/\/.*:.*@/, '//***:***@')}`);
    
    const options = {
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 10000, // Keep trying to send operations for 10 seconds
      socketTimeoutMS: 45000 // Close sockets after 45 seconds of inactivity
    };

    const conn = await mongoose.connect(mongoURI, options);

    logger.info(`🗄️  MongoDB Connected: ${conn.connection.host}`);

    // Handle connection events
    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      logger.info('MongoDB reconnected');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      logger.info('MongoDB connection closed through app termination');
      process.exit(0);
    });

  } catch (error) {
    logger.error('Error connecting to MongoDB:', error);
    // Don't exit in development, let the app continue
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
};

module.exports = connectDB;
