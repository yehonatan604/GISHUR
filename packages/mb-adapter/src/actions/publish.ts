import amqp from "amqplib";
import { Topology } from "../types/types.js";

export const publishMain = (
    ch: amqp.Channel,
    t: Topology,
    payload: unknown,
    headers: Record<string, any> = {}
) => {
    const body = Buffer.from(JSON.stringify(payload));
    ch.publish(t.mainEx, t.rkMain, body, { persistent: true, headers });
}
