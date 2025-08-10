// services/db-service/src/messageBroker.ts
import { UserModel } from '../models/User.model.js';
import { env } from '@bridgepoint/env';
import { getPersistentChannel } from '@bridgepoint/mb-adapter'; // ⬅️ במקום withChannel

const QUEUE = 'db_action_queue';

export const initMessageBroker = async () => {
    const channel: any = await getPersistentChannel(env.MESSAGE_BROKER_URL!);

    await channel.assertQueue(QUEUE, { durable: true });
    try { await channel.prefetch(10); } catch { }
    console.log(`✅ Listening to ${QUEUE}`);

    await channel.consume(
        QUEUE,
        async (msg: any) => {
            if (!msg) return;

            try {
                const { replyTo, correlationId } = msg.properties || {};
                const bodyStr = msg.content.toString();
                console.log('📥 DB command:', bodyStr, { correlationId, replyTo });

                const { action, collection, payload } = JSON.parse(bodyStr);

                if (action === 'findOne' && collection === 'users') {
                    const doc = await UserModel.findOne(payload).lean().maxTimeMS(2500);
                    const user = doc ? { _id: doc._id, password: doc.password } : null;

                    if (replyTo && correlationId) {
                        const res = JSON.stringify({ user });
                        console.log('↩️ DB -> reply', { correlationId, hasUser: !!user, len: res.length });
                        channel.sendToQueue(replyTo, Buffer.from(res), { correlationId });
                    } else {
                        console.error('❌ Missing replyTo/correlationId');
                    }
                } else {
                    if (replyTo && correlationId) {
                        channel.sendToQueue(
                            replyTo,
                            Buffer.from(JSON.stringify({ error: 'Unsupported action' })),
                            { correlationId }
                        );
                    }
                }

                channel.ack(msg);
            } catch (err: any) {
                console.error('❌ Error handling DB command:', err?.message || err);
                try {
                    const { replyTo, correlationId } = msg.properties || {};
                    if (replyTo && correlationId) {
                        channel.sendToQueue(
                            replyTo,
                            Buffer.from(JSON.stringify({ error: 'DB error' })),
                            { correlationId }
                        );
                    }
                } finally {
                    channel.ack(msg);
                }
            }
        },
        { noAck: false }
    );
};
