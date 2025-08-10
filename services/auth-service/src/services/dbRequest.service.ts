// services/auth-service/src/services/dbRequest.service.ts
import { RpcClient } from "@bridgepoint/mb-adapter";
import { DbResponse } from "@bridgepoint/types";

type UserForLogin = { _id: string; password: string };

export async function requestUserFromDb(ch: any, email: string) {
    const rpc = new RpcClient(ch);

    const payload = {
        action: "findOne" as const,
        collection: "users",
        filter: { email },
        projection: "_id password",
    };

    const res = await rpc.request<typeof payload, DbResponse<UserForLogin | null>>(
        "db_action_queue",
        payload,
        5000
    );

    if (!res.ok || !res.data) return null;
    return res.data;
}
