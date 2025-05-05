import mongoose from 'mongoose';
import { getConnectionString } from '../mongoose/db-config';

// Global promise for the database connection
let dbConnect: Promise<typeof mongoose> | null = null;

export async function connectToDatabase() {
  try {
    // If we already have a connection promise, return it
    if (dbConnect) {
      await dbConnect;
      return;
    }

    // If mongoose is already connected, use that connection
    if (mongoose.connection.readyState === 1) {
      console.log('Using existing database connection');
      return;
    }

    console.log('Creating new database connection...');
    const connectionString = getConnectionString();

    // Create a new connection promise
    dbConnect = mongoose.connect(connectionString, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4
    });

    // Wait for the connection
    await dbConnect;
    console.log('Connected to MongoDB');

    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
      dbConnect = null;
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
      dbConnect = null;
    });

  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    dbConnect = null;
    throw error;
  }
}

// Only disconnect when explicitly called
export async function disconnectFromDatabase() {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
      dbConnect = null;
      console.log('Disconnected from MongoDB');
    }
  } catch (error) {
    console.error('Error disconnecting from MongoDB:', error);
    throw error;
  }
}

// Handle process termination
process.on('SIGTERM', async () => {
  await disconnectFromDatabase();
  process.exit(0);
});

process.on('SIGINT', async () => {
  await disconnectFromDatabase();
  process.exit(0);
});