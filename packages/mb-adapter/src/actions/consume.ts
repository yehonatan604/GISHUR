import amqp from "amqplib";
import { Topology, RetryOptions } from "../types/types.js";

export function consumeWithRetry(
    ch: amqp.Channel,
    t: Topology,
    handler: (msg: amqp.ConsumeMessage) => Promise<void>,
    opts: RetryOptions
) {
    ch.consume(t.mainQ, async (msg) => {
        if (!msg) return;
        try {
            await handler(msg);
            ch.ack(msg);
        } catch (err) {
            const prev = (msg.properties.headers?.["x-retry"] as number) ?? 0;
            const next = prev + 1;

            if (next <= opts.maxRetries) {
                ch.publish(t.retryEx, t.rkRetry, msg.content, {
                    persistent: true,
                    headers: { ...msg.properties.headers, "x-retry": next }
                });
            } else {
                ch.publish(t.dlxEx, t.rkDlq, msg.content, {
                    persistent: true,
                    headers: { ...msg.properties.headers, "x-retry": next, "x-error": String(err) }
                });
            }
            ch.ack(msg);
        }
    }, { noAck: false });
}
