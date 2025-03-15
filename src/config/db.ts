import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const options = {
    autoIndex: true,
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    family: 4
}

const connectDB = async (): Promise<void> => {
    try {
        const mongoURL = process.env.MONGODB_URL || 'mongodb://localhost:27017/youtube-fetcher';
        await mongoose.connect(mongoURL, options);
        console.log('MongoDB Connected Successfully');

        mongoose.connection.on('error', (err) => {
            console.error('MongoDB connection error:', err);
        });

        mongoose.connection.on('disconnected', () => {
            console.warn('MongoDB disconnected. Attempting to reconnect...');
            setTimeout(() => connectDB(), 5000);
        });

        mongoose.connection.on('reconnected', () => {
            console.log('MongoDB reconnected');
        });

        process.on('SIGINT', async () => {
            await mongoose.connection.close();
            console.log('MongoDB connection closed due to app termination');
            process.exit(0);
        });
    } catch( err) {
        console.log('Failed to connect to MongoDB:', err);
        process.exit(1);
    }
}

export default connectDB;
