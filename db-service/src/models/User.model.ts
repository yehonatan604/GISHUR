import { Schema, model } from 'mongoose';
import { User } from '../types/User.js';

const UserSchema = new Schema<User>({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    isVerified: {
        type: Boolean,
        required: true
    },
    cases: [{
        type: Schema.Types.ObjectId,
        ref: "Case",
        default: []
    }]


}, { versionKey: false });

export const UserModel = model<User>('User', UserSchema);