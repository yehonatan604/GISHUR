import mongoose from 'mongoose';
import { UserModel } from '../models/User.model.js';

export const seedUsers = async () => {
    try {
        console.log('🌱 Starting seed...');

        const existing = await UserModel.findOne({ email: 'test@example.com' });
        if (existing) {
            console.log('ℹ️ User already exists. Skipping seed.');
            return;
        }

        const user = await UserModel.create({
            firstName: 'Test',
            lastName: 'User',
            email: 'test@example.com',
            password: 'f25d5448628aab79eda758e0fca9ef50:4e11fa5b14ef10195baa84cbc6fa38310484164b3491022ba8b942b8eec802b4f69ba98ed2b29600df2d6e76b2cafeb3d3d4f819ad028a27806ec9dd2f663a17', // סיסמה מראש
            isVerified: true,
            cases: [],
        });

        console.log('✅ Seed complete:', user._id.toString());
    } catch (err) {
        console.error('❌ Seed failed:', err);
    }
}
