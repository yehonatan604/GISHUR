export type CaseSide = {
    title: string;
    arguments: string[];
}

export type CasePayload = {
    caseId: string;
    user1: string;
    user2: string;
    timestamp: number;
    sideA: CaseSide;
    sideB: CaseSide;
}
