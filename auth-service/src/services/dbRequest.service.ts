import amqp from 'amqplib';
import { randomUUID } from 'crypto';

export async function requestUserFromDb(
    ch: amqp.Channel,
    email: string
): Promise<{ _id: string; password: string } | null> {
    const { queue: replyQ } = await ch.assertQueue('', { exclusive: true, durable: false, autoDelete: true });
    const cid = randomUUID();

    return new Promise(async (resolve) => {
        const to = setTimeout(async () => {
            try { await ch.cancel(tag); } catch { }
            resolve(null);
        }, 5000);

        const { consumerTag: tag } = await ch.consume(
            replyQ,
            async (msg) => {
                if (!msg || msg.properties.correlationId !== cid) return;
                clearTimeout(to);
                try {
                    const data = JSON.parse(msg.content.toString());
                    // מצפה ל-{ user: {...} }
                    resolve(data.user ?? null);
                } catch {
                    resolve(null);
                } finally {
                    try { await ch.cancel(tag); } catch { }
                }
            },
            { noAck: true }
        );

        ch.sendToQueue(
            'db_action_queue',
            Buffer.from(JSON.stringify({ action: 'findOne', collection: 'users', payload: { email } })),
            { replyTo: replyQ, correlationId: cid }
        );
    });
}
