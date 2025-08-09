import amqp, { ConsumeMessage } from 'amqplib';
import { envService } from '../services/env.service.js';
import { UserModel } from '../models/User.model.js';

export const startConsumer = async () => {
    const connection = await amqp.connect(envService.vars.MESSAGE_BROKER_URL);
    const channel = await connection.createChannel();
    const QUEUE = 'db_action_queue';

    await channel.assertQueue(QUEUE, { durable: true });
    console.log(`✅ Listening to ${QUEUE}`);

    channel.consume(QUEUE, async (msg: ConsumeMessage | null) => {
        if (!msg) return;

        try {
            const { replyTo, correlationId } = msg.properties;
            const bodyStr = msg.content.toString();
            console.log('📥 DB command:', bodyStr, { correlationId, replyTo });

            const { action, collection, payload } = JSON.parse(bodyStr);

            if (action === 'find' && collection === 'users') {
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
                // תחזיר גם במקרה שלא נתמך, כדי שה-auth לא יטיים־אאוט
                if (replyTo && correlationId) {
                    channel.sendToQueue(replyTo, Buffer.from(JSON.stringify({ error: 'Unsupported action' })), { correlationId });
                }
            }

            channel.ack(msg);
        } catch (err: any) {
            console.error('❌ Error handling DB command:', err?.message || err);
            // 🔴 אל תעשה nack בלי תשובה — תחזיר שגיאה ואז ack
            try {
                const { replyTo, correlationId } = msg!.properties;
                if (replyTo && correlationId) {
                    channel.sendToQueue(replyTo, Buffer.from(JSON.stringify({ error: 'DB error' })), { correlationId });
                }
            } finally {
                channel.ack(msg!);
            }
        }
    });

};
