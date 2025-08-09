// types/Case.ts
import type { HydratedDocument, Types } from "mongoose";
import type { User } from "./User";

export type Case = {
    caseId: string;
    user1: Types.ObjectId;
    user2: Types.ObjectId;
    timestamp: number;
    sideA: {
        title: string;
        arguments: string[];
    };
    sideB: {
        title: string;
        arguments: string[];
    };
};

export type PopulatedCase = Omit<Case, 'user'> & {
    user: User;
};

export type CaseDocument = HydratedDocument<Case>;
export type PopulatedCaseDocument = HydratedDocument<PopulatedCase>;
