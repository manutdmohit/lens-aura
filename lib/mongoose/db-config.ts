import mongoose from 'mongoose';

// This file just contains configuration, not the actual connection
// The connection would be established in a separate file when integrating

// Define a function to format MongoDB connection string
export const getConnectionString = () => {
  const uri = process.env.MONGODB_URI!;

  if (!uri) {
    throw new Error('Please define the MONGODB_URI environment variable');
  }

  return uri;
};

// Export mongoose for use in model files
export { mongoose };