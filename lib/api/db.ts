import mongoose from 'mongoose';
import { getConnectionString } from '../mongoose/db-config';

let isConnecting = false;

export async function connectToDatabase() {
  if (mongoose.connection.readyState === 1 || isConnecting) {
    return;
  }

  try {
    console.log('Connecting to MongoDB...');
    isConnecting = true;

    await mongoose.connect(getConnectionString(), {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4,
    });

    console.log('Connected to MongoDB');

    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected');
    });

  } catch (error) {
    console.error('MongoDB connection failed:', error);
    throw error;
  } finally {
    isConnecting = false;
  }
}

export async function disconnectFromDatabase() {
  if (mongoose.connection.readyState === 0) {
    return;
  }

  try {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error disconnecting from MongoDB:', error);
    throw error;
  }
}
