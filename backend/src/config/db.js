import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        if (!process.env.MONGO_URI || process.env.MONGO_URI === 'your_mongo_db_uri_here') {
            console.warn('⚠️  MONGO_URI is not set or is using placeholder. Skipping MongoDB connection.');
            return;
        }

        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error connecting to MongoDB: ${error.message}`);
        process.exit(1);
    }
};

export default connectDB;
