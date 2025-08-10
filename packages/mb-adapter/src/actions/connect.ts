import * as amqp from "amqplib";
import { assertTopology } from "./topology.js";
import { Topology, RetryOptions } from "../types/types.js";
import { consumeWithRetry } from "./consume.js";
import { publishMain } from "./publish.js";

export type MessagingHandle = {
    topology: Topology;
    publish: (payload: unknown, headers?: Record<string, any>) => void;
    consume: (handler: (msg: amqp.ConsumeMessage) => Promise<void>, opts: RetryOptions) => void;
    close: () => Promise<void>;
};

export const connectAndSetup = async (
    url: string,
    namespace: string,
    retryDelayMs = 30_000
): Promise<MessagingHandle> => {
    const conn = await amqp.connect(url);
    const ch = await conn.createChannel();
    const topology = await assertTopology(ch, namespace, retryDelayMs);

    return {
        topology,
        publish: (payload, headers = {}) => publishMain(ch, topology, payload, headers),
        consume: (handler, opts) => consumeWithRetry(ch, topology, handler, opts),
        close: async () => {
            try { await ch.close(); } catch { }
            try { await conn.close(); } catch { }
        }
    };
}
