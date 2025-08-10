export type DbResponse<T = unknown> = {
    ok: boolean;
    data?: T;
    result?: unknown;
    error?: string;
    details?: string;
};
