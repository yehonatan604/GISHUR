import { ConsumeMessage } from 'amqplib';
import { verifyPassword } from '../services/hash.service';
import { generateToken } from '../services/jwt.service';
import { requestUserFromDb } from '../services/dbRequest.service';
import { Channel } from 'amqplib';

const QUEUE = 'auth_action_queue';

export const initAuthListener = async (channel: Channel) => {
    await channel.assertQueue(QUEUE, { durable: true });
    console.log(`🔐 Listening to "${QUEUE}"`);

    channel.consume(QUEUE, async (msg: ConsumeMessage | null) => {
        if (!msg) return;

        try {
            const { type, email, password } = JSON.parse(msg.content.toString());

            if (type !== 'login') {
                channel.nack(msg, false, false);
                return;
            }

            const user = await requestUserFromDb(channel, email, msg.properties.correlationId);

            if (!user || typeof user.passwordHash !== 'string') {
                sendReply(channel, msg, { error: 'User not found' });
                return;
            }

            const isValid = await verifyPassword(password, user.passwordHash);
            if (!isValid) {
                sendReply(channel, msg, { error: 'Invalid password' });
                return;
            }

            const token = generateToken(user._id);
            sendReply(channel, msg, { token });

        } catch (err) {
            console.error('❌ auth.listener error:', err);
            channel.nack(msg, false, false);
        }

        channel.ack(msg);
    });
};

const sendReply = (channel: Channel, msg: ConsumeMessage, payload: any) => {
    if (!msg.properties.replyTo || !msg.properties.correlationId) return;

    channel.sendToQueue(
        msg.properties.replyTo,
        Buffer.from(JSON.stringify(payload)),
        { correlationId: msg.properties.correlationId }
    );
};
