import * as amqp from "amqplib";

/**
 * Opens a connection + channel, runs your fn, and closes gracefully.
 * Services do NOT need to import amqplib.
 */
export async function withChannel<T>(
    url: string,
    fn: (ch: any, conn: any) => Promise<T> // intentionally "any" to avoid leaking amqplib types
): Promise<T> {
    const conn = await amqp.connect(url);
    const ch = await conn.createChannel();

    try {
        return await fn(ch, conn);
    } finally {
        try { await ch.close(); } catch { }
        try { await conn.close(); } catch { }
    }
}
