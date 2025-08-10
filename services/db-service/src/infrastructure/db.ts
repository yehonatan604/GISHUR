import mongoose from 'mongoose';
import { seedUsers } from '../services/seed.service.js';
import { env } from '@bridgepoint/env';

const connectToDb = async () => {
    const { NODE_ENV, DB_URL } = env;
    try {
        await mongoose.connect(DB_URL!);
        if (NODE_ENV === 'development') await seedUsers();
        console.log('✅ Connected to MongoDB');
    } catch (error) {
        console.error('❌ Error connecting to MongoDB:', error);
    }
};

export const db = {
    connect: connectToDb,
    mongoose
};