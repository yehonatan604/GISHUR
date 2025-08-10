import amqp from "amqplib";
import { Topology } from "../types/types.js";

export async function assertTopology(
    ch: amqp.Channel,
    namespace: string,
    retryDelayMs: number
): Promise<Topology> {
    const mainEx = `${namespace}.x`;
    const retryEx = `${namespace}.x.retry`;
    const dlxEx = `${namespace}.x.dlx`;

    const mainQ = `${namespace}.q`;
    const retryQ = `${namespace}.q.retry`;
    const dlq = `${namespace}.q.dlq`;

    const rkMain = `${namespace}.rk`;
    const rkRetry = `${namespace}.rk.retry`;
    const rkDlq = `${namespace}.rk.dlq`;

    // exchanges
    await ch.assertExchange(mainEx, "direct", { durable: true });
    await ch.assertExchange(retryEx, "direct", { durable: true });
    await ch.assertExchange(dlxEx, "direct", { durable: true });

    // main queue → DLX on dead-letter
    await ch.assertQueue(mainQ, {
        durable: true,
        arguments: {
            "x-dead-letter-exchange": dlxEx,
            "x-dead-letter-routing-key": rkDlq,
            // אופציונלי: "x-queue-mode": "lazy"
        }
    });

    // retry queue → אחרי TTL חוזר ל-main
    await ch.assertQueue(retryQ, {
        durable: true,
        arguments: {
            "x-message-ttl": retryDelayMs,
            "x-dead-letter-exchange": mainEx,
            "x-dead-letter-routing-key": rkMain
        }
    });

    // dead-letter queue
    await ch.assertQueue(dlq, { durable: true });

    // bindings
    await ch.bindQueue(mainQ, mainEx, rkMain);
    await ch.bindQueue(retryQ, retryEx, rkRetry);
    await ch.bindQueue(dlq, dlxEx, rkDlq);

    return { mainEx, retryEx, dlxEx, mainQ, retryQ, dlq, rkMain, rkRetry, rkDlq };
}
