import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const dbUrl = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/guruconnect';
    // Log dynamic info to help debugging without exposing passwords
    const connectionLogString = dbUrl.startsWith('mongodb+srv://') 
      ? 'MongoDB Atlas Cluster' 
      : dbUrl;
    console.log(`Attempting to connect to: ${connectionLogString}`);
    const conn = await mongoose.connect(dbUrl);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Database Connection Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
