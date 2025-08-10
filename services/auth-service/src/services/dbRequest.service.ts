import { RpcClient } from "@bridgepoint/mb-adapter";
import { DbResponse } from "@bridgepoint/types";

type UserForLogin = { _id: string; password: string };
type CreateUserDoc = { email: string; password: string; firstName?: string; lastName?: string };

export async function findUserByEmail(ch: any, email: string) {
    const rpc = new RpcClient(ch);
    const res = await rpc.request<
        { action: "findOne"; collection: "users"; filter: { email: string }; projection: string },
        DbResponse<UserForLogin | null>
    >("db_action_queue", { action: "findOne", collection: "users", filter: { email }, projection: "_id password" }, 5000);
    return res.ok ? res.data ?? null : null;
}

export async function createUser(ch: any, doc: CreateUserDoc) {
    const rpc = new RpcClient(ch);
    const res = await rpc.request<
        { action: "create"; collection: "users"; payload: CreateUserDoc },
        DbResponse<string | null>
    >("db_action_queue", { action: "create", collection: "users", payload: doc }, 5000);
    return res.ok ? res.data ?? null : null;
}
