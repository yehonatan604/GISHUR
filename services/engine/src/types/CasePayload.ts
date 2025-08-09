export interface CaseSide {
    title: string;
    arguments: string[];
}

export interface CasePayload {
    caseId: string;
    user1: string;
    user2: string;
    timestamp: number;
    sideA: CaseSide;
    sideB: CaseSide;
}
