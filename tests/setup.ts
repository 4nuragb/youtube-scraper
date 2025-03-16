import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.test'});

beforeAll(async () => {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/youtube-fetcher-test';
    await mongoose.connect(uri);
});

afterEach(async () => {
    const collections = mongoose.connection.collections;
    for( const key in collections) {
        await collections[key].deleteMany({});
    }
});

afterAll(async () => {
    await mongoose.connection.close();
});
