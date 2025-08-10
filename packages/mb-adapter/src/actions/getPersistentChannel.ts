import amqp from 'amqplib';

type AmqpConnection = Awaited<ReturnType<typeof amqp.connect>>;
type AmqpChannel = Awaited<ReturnType<AmqpConnection['createChannel']>>;

let connection: AmqpConnection | null = null;
let channel: AmqpChannel | null = null;

export const getPersistentChannel = async (url: string): Promise<AmqpChannel> => {
    if (channel) return channel;

    connection = await amqp.connect(url);
    channel = await connection.createChannel();

    console.log('🐑 Persistent channel established');
    return channel;
};

export const closePersistentChannel = async () => {
    try { await channel?.close(); } catch { }
    try { await connection?.close(); } catch { }
    channel = null;
    connection = null;
};
