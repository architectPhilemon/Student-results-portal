const mongoose = require('mongoose');
require('dotenv').config(); // Ensure dotenv is loaded here

const connectDB = async () => {
  try {
    console.log('Attempting to connect to MongoDB...');
    console.log('MONGODB_URI from database.js:', process.env.MONGODB_URI); // For debugging

    // Set mongoose options for better connection handling
    mongoose.set('strictQuery', false);
    
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      // Modern connection options
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      // Removed deprecated options: bufferMaxEntries and bufferCommands
    });

    console.log(`
🍃 MongoDB Atlas Connected Successfully!
📍 Host: ${conn.connection.host}
📊 Database: ${conn.connection.name}
🔗 Connection State: ${conn.connection.readyState === 1 ? 'Connected' : 'Connecting...'}
⏰ Connected at: ${new Date().toISOString()}
    `);
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️  MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('🔒 MongoDB connection closed through app termination');
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
};

module.exports = connectDB;
