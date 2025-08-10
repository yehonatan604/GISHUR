// services/db-service/src/messageBroker.ts
import { env } from "@bridgepoint/env";
import { DbActionSchema, z } from "@bridgepoint/zod-schemas";
import { getPersistentChannel } from "@bridgepoint/mb-adapter";

import { CaseModel } from "../models/Case.model.js";
import { UserModel } from "../models/User.model.js";

const QUEUE = "db_action_queue";
const DEFAULT_MAX_TIME_MS = 2500;
const DEFAULT_LIMIT = 100;

const collections = {
    cases: CaseModel,
    users: UserModel,
} as const;

type DbActionInput = z.infer<typeof DbActionSchema>;

function getModel(name: string) {
    const model = (collections as Record<string, any>)[name];
    if (!model) throw new Error(`Unknown collection: ${name}`);
    return model;
}

async function handleDbAction(input: DbActionInput) {
    const {
        action,
        collection,
        filter = {},
        projection,
        sort,
        limit = DEFAULT_LIMIT,
        options = {},
        payload,
        update,
        pipeline,
        maxTimeMS = DEFAULT_MAX_TIME_MS,
    } = input;

    const Model = getModel(collection);

    switch (action) {
        case "findOne": {
            const doc = await Model.findOne(filter)
                .select(projection as any)
                .lean()
                .maxTimeMS(maxTimeMS);
            return { ok: true, data: doc ?? null };
        }

        case "find": {
            const docs = await Model.find(filter)
                .select(projection as any)
                .sort(sort as any)
                .limit(limit)
                .lean()
                .maxTimeMS(maxTimeMS);
            return { ok: true, data: docs };
        }

        case "countDocuments": {
            const count = await Model.countDocuments(filter).maxTimeMS(maxTimeMS);
            return { ok: true, data: count };
        }

        case "create": {
            if (payload == null) throw new Error("create: payload is required");
            const doc = await Model.create(payload);
            return { ok: true, data: doc?._id ?? null };
        }

        case "insertMany": {
            if (!Array.isArray(payload)) throw new Error("insertMany: payload must be array");
            const docs = await Model.insertMany(payload, options);
            return { ok: true, data: docs.map((d: any) => d._id) };
        }

        case "updateOne": {
            if (update == null) throw new Error("updateOne: update is required");
            const res = await Model.updateOne(filter, update, options).maxTimeMS?.(maxTimeMS);
            return { ok: true, result: normalizeWriteResult(res) };
        }

        case "updateMany": {
            if (update == null) throw new Error("updateMany: update is required");
            const res = await Model.updateMany(filter, update, options).maxTimeMS?.(maxTimeMS);
            return { ok: true, result: normalizeWriteResult(res) };
        }

        case "deleteOne": {
            const res = await Model.deleteOne(filter).maxTimeMS?.(maxTimeMS);
            return { ok: true, result: normalizeDeleteResult(res) };
        }

        case "deleteMany": {
            const res = await Model.deleteMany(filter).maxTimeMS?.(maxTimeMS);
            return { ok: true, result: normalizeDeleteResult(res) };
        }

        case "aggregate": {
            if (!Array.isArray(pipeline)) throw new Error("aggregate: pipeline must be array");
            const docs = await Model.aggregate(pipeline).option({ maxTimeMS }).exec();
            return { ok: true, data: docs };
        }

        default:
            throw new Error(`Unsupported action: ${action}`);
    }
}

// Normalize Mongoose write results into a small, transport-friendly shape.
function normalizeWriteResult(res: any) {
    return {
        acknowledged: !!res?.acknowledged,
        matchedCount: res?.matchedCount ?? res?.n ?? 0,
        modifiedCount: res?.modifiedCount ?? res?.nModified ?? 0,
        upsertedId: res?.upsertedId ?? res?.upserted?._id ?? null,
    };
}

function normalizeDeleteResult(res: any) {
    return {
        acknowledged: !!res?.acknowledged,
        deletedCount: res?.deletedCount ?? 0,
    };
}

export const initMessageBroker = async () => {
    const channel: any = await getPersistentChannel(env.MESSAGE_BROKER_URL!);

    await channel.assertQueue(QUEUE, { durable: true });
    try { await channel.prefetch(10); } catch { /* older brokers may not support */ }
    console.log(`✅ Listening to ${QUEUE}`);

    await channel.consume(
        QUEUE,
        async (msg: any) => {
            if (!msg) return;

            const { replyTo, correlationId } = msg.properties || {};
            const bodyStr = msg.content?.toString?.() ?? "";

            const reply = (payload: unknown) => {
                if (replyTo && correlationId) {
                    const buf = Buffer.from(JSON.stringify(payload));
                    channel.sendToQueue(replyTo, buf, { correlationId });
                } else {
                    console.error("❌ Missing replyTo/correlationId");
                }
            };

            try {
                const parsed = DbActionSchema.safeParse(JSON.parse(bodyStr));
                if (!parsed.success) {
                    const errMsg = parsed.error.issues.map(i => `${i.path.join(".")}: ${i.message}`).join("; ");
                    reply({ ok: false, error: `Validation failed: ${errMsg}` });
                    return channel.ack(msg);
                }

                const input = parsed.data;

                if ((input.action === "find" || input.action === "findOne") &&
                    input.collection === "users" &&
                    input.projection == null) {
                    input.projection = "-password";
                }

                console.log("📥 DB:", input, { correlationId });
                const res = await handleDbAction(input);
                reply(res);
            } catch (err: any) {
                console.error("❌ DB handler error:", err?.message || err);
                reply({ ok: false, error: "DB error", details: err?.message });
            } finally {
                channel.ack(msg);
            }
        },
        { noAck: false }
    );
};
