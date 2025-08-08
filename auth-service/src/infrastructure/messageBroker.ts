import amqp, { ConsumeMessage } from 'amqplib';
import { envService } from '../services/env.service.js';

const QUEUE = 'auth_action_queue';

export const initMessageBroker = async () => {
    const conn = await amqp.connect(envService.vars.MESSAGE_BROKER_URL!);
    const channel = await conn.createChannel();

    await channel.assertQueue(QUEUE, { durable: true });
    console.log(`📩 Listening to "${QUEUE}"`);

    channel.consume(QUEUE, async (msg: ConsumeMessage | null) => {
        if (!msg) return;

        try {
            const content = JSON.parse(msg.content.toString());
            console.log('📩 Received message:', content);
            // Handle the message based on its type
            // For example, if it's a login action:
            if (content.type === 'login') {
                // Process login
            }
            channel.ack(msg);
        } catch (err) {
            console.error('❌ Message handling error:', err);
            channel.nack(msg, false, false);
        }
    });

    return channel;
};
