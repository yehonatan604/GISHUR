import type { HydratedDocument } from 'mongoose';

export type Case = {
    caseId: string;
    userId: string;
    timestamp: number;
    sideA: {
        title: string;
        arguments: string[];
    };
    sideB: {
        title: string;
        arguments: string[];
    };
}


export type CaseDocument = HydratedDocument<Case>;
