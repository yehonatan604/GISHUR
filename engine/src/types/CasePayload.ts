export interface CaseSide {
    title: string;
    arguments: string[];
}

export interface CasePayload {
    caseId: string;
    userId: string;
    timestamp: number;
    sideA: CaseSide;
    sideB: CaseSide;
}
