import mongoose from 'mongoose';
import { envService } from '../services/env.service.js';

const connectToDb = async () => {
    try {
        await mongoose.connect(envService.vars.DB_URL);
        console.log('✅ Connected to MongoDB');
    } catch (error) {
        console.error('❌ Error connecting to MongoDB:', error);
    }
};

export const db = {
    connect: connectToDb,
    mongoose
};