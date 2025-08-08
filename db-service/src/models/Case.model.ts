import { Schema, model } from 'mongoose';
import { UserModel } from './User.model.js'; // Make sure path is correct
import type { Case } from '../types/Case.js';

const CaseSchema = new Schema<Case>({
    caseId: { type: String, required: true, unique: true },
    user1: { type: Schema.Types.ObjectId, ref: "User", required: true },
    user2: { type: Schema.Types.ObjectId, ref: "User", required: true },
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

CaseSchema.post('save', async function (doc) {
    if (doc.user1.equals(doc.user2)) {
        await UserModel.updateOne(
            { _id: doc.user1 },
            { $addToSet: { cases: doc._id } }
        );
    } else {
        await Promise.all([
            UserModel.updateOne(
                { _id: doc.user1 },
                { $addToSet: { cases: doc._id } }
            ),
            UserModel.updateOne(
                { _id: doc.user2 },
                { $addToSet: { cases: doc._id } }
            )
        ]);
    }

});

export const CaseModel = model<Case>('Case', CaseSchema);
