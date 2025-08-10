import * as amqp from "amqplib";

export const withChannel = async <T>(
    url: string,
    fn: (ch: any, conn: any) => Promise<T>
): Promise<T> => {
    const conn = await amqp.connect(url);
    const ch = await conn.createChannel();

    try {
        return await fn(ch, conn);
    } finally {
        try { await ch.close(); } catch { }
        try { await conn.close(); } catch { }
    }
}
