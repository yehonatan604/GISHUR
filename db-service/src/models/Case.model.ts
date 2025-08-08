import { Schema, model } from 'mongoose';
import type { Case } from '../types/Case.js';

const CaseSchema = new Schema<Case>({
    caseId: { type: String, required: true, unique: true },
    userId: { type: String, required: true },
    timestamp: { type: Number, required: true },
    sideA: {
        title: { type: String, required: true },
        arguments: { type: [String], required: true },
    },
    sideB: {
        title: { type: String, required: true },
        arguments: { type: [String], required: true },
    },
}, { versionKey: false });

export const CaseModel = model<Case>('Case', CaseSchema);