import mongoose from 'mongoose';
import { envService } from '../services/env.service.js';
import { seedUsers } from '../services/seed.service.js';

const connectToDb = async () => {
    const { DEV_MODE, DB_URL } = envService.vars;
    try {
        await mongoose.connect(DB_URL);
        if (DEV_MODE) await seedUsers();
        console.log('✅ Connected to MongoDB');
    } catch (error) {
        console.error('❌ Error connecting to MongoDB:', error);
    }
};

export const db = {
    connect: connectToDb,
    mongoose
};