import amqp, { ConsumeMessage } from 'amqplib';
import { envService } from '../services/env.service';
import { handleDbAction } from '../services/dbHandler.service';

export const startConsumer = async () => {
    const connection = await amqp.connect(envService.vars.MESSAGE_BROKER_URL);
    const channel = await connection.createChannel();
    const QUEUE = 'db_action_queue';

    await channel.assertQueue(QUEUE, { durable: true });
    console.log(`✅ Listening to ${QUEUE}`);

    channel.consume(QUEUE, async (msg: ConsumeMessage | null) => {
        if (!msg) return;

        try {
            const payload = JSON.parse(msg.content.toString());
            console.log('📥 Received DB command:', payload);

            const result = await handleDbAction(payload);

            if (msg.properties.replyTo) {
                channel.sendToQueue(msg.properties.replyTo, Buffer.from(JSON.stringify(result)), {
                    correlationId: msg.properties.correlationId
                });
            }

            channel.ack(msg);
        } catch (err) {
            console.error('❌ Error handling DB command:', err);
            channel.nack(msg, false, false); // reject without requeue
        }
    });
};
