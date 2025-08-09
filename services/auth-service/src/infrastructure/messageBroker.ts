import { ConsumeMessage, Channel } from 'amqplib';
import { verifyPassword } from '../services/hash.service.js';
import { generateToken } from '../services/jwt.service.js';
import { requestUserFromDb } from '../services/dbRequest.service.js';
import { env } from '../env.js';
import amqp from 'amqplib';

const QUEUE = 'auth_action_queue';

export const initAuthListener = async () => {
    const conn = await amqp.connect(env.MESSAGE_BROKER_URL!);
    const channel = await conn.createChannel();
    await channel.assertQueue(QUEUE, { durable: true });
    console.log(`🔐 Listening to "${QUEUE}"`);

    channel.consume(QUEUE, async (msg: ConsumeMessage | null) => {
        if (!msg) return;

        try {
            const { type, email, password } = JSON.parse(msg.content.toString());

            if (type !== 'login') {
                // ignore unknown types, but ACK so it doesn't stick
                return;
            }

            const user = await requestUserFromDb(channel, email);

            if (!user || typeof user.password !== 'string') {
                sendReply(channel, msg, { error: 'User not found' });
            } else {
                const isValid = await verifyPassword(password, user.password);
                if (!isValid) {
                    sendReply(channel, msg, { error: 'Invalid password' });
                } else {
                    const token = generateToken(user._id);
                    sendReply(channel, msg, { token });
                }
            }
        } catch (err) {
            console.error('❌ auth.listener error:', err);
            try { sendReply(channel, msg!, { error: 'Internal error' }); } catch { }
        } finally {
            try { channel.ack(msg!); } catch (e) { /* channel might be closed if earlier bug */ }
        }
    });
};

const sendReply = (channel: Channel, msg: ConsumeMessage, payload: any) => {
    const { replyTo, correlationId } = msg.properties;
    if (!replyTo || !correlationId) return;
    channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(payload)), { correlationId });
};
