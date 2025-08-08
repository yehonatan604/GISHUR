import amqp, { ConsumeMessage } from 'amqplib';
import { handleDbAction } from '../services/dbHandler.service';
import { envService } from '../services/env.service';

const QUEUE = 'db_action_queue';

export const initMessageBroker = async () => {
    const conn = await amqp.connect(envService.vars.MESSAGE_BROKER_URL!);
    const ch = await conn.createChannel();

    await ch.assertQueue(QUEUE, { durable: true });
    console.log(`📩 Listening to "${QUEUE}"`);

    ch.consume(QUEUE, async (msg: ConsumeMessage | null) => {
        if (!msg) return;

        try {
            const content = JSON.parse(msg.content.toString());

            const result = await handleDbAction(content);

            if (content.replyTo) {
                ch.sendToQueue(content.replyTo, Buffer.from(JSON.stringify(result)));
            }

            ch.ack(msg);
        } catch (err) {
            console.error('❌ Message handling error:', err);
            ch.nack(msg, false, false);
        }
    });
};
