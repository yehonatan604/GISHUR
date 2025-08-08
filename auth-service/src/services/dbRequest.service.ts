import amqp from 'amqplib';

export const requestUserFromDb = (
    channel: amqp.Channel,
    email: string,
    correlationId: string
): Promise<{ _id: string; passwordHash: string } | null> => {
    return new Promise(async (resolve) => {
        const dbReplyQueue = 'auth_temp_reply_' + correlationId;

        await channel.assertQueue(dbReplyQueue, { exclusive: true });

        const timeout = setTimeout(() => {
            console.warn(`⏳ Timeout: No response for correlationId ${correlationId}`);
            resolve(null);
        }, 5000); // 5 שניות המתנה לתשובה

        channel.consume(dbReplyQueue, (msg) => {
            if (!msg) return;

            if (msg.properties.correlationId === correlationId) {
                clearTimeout(timeout);
                const data = JSON.parse(msg.content.toString());
                resolve(data.user || null);
            }
        }, { noAck: true });

        const message = {
            action: 'findUserByEmail',
            model: 'users',
            query: { email }
        };

        channel.sendToQueue(
            'db_action_queue',
            Buffer.from(JSON.stringify(message)),
            {
                replyTo: dbReplyQueue,
                correlationId
            }
        );
    });
};
