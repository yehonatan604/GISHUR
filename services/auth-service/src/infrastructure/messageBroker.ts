import { verifyPassword } from '../services/hash.service.js';
import { generateToken } from '../services/jwt.service.js';
import { requestUserFromDb } from '../services/dbRequest.service.js';
import { env } from '@bridgepoint/env';
import { getPersistentChannel } from '@bridgepoint/mb-adapter';

const QUEUE = 'auth_action_queue';

export const initMessageBroker = async () => {
    const channel = await getPersistentChannel(env.MESSAGE_BROKER_URL!);

    await channel.assertQueue(QUEUE, { durable: true });
    console.log(`🔐 Listening to "${QUEUE}"`);

    await channel.consume(
        QUEUE,
        async (msg: any) => {
            if (!msg) return;

            try {
                const { type, email, password } = JSON.parse(msg.content.toString());
                if (type !== 'login') {
                    channel.ack(msg);
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
                try { channel.ack(msg!); } catch { }
            }
        },
        { noAck: false }
    );
};

const sendReply = (channel: any, msg: any, payload: any) => {
    const { replyTo, correlationId } = msg.properties || {};
    if (!replyTo || !correlationId) return;
    channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(payload)), { correlationId });
};
