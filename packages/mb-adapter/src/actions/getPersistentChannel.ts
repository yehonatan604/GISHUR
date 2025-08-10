import amqp from 'amqplib';

// הגדרות טיפוסים מדויקות
type AmqpConnection = Awaited<ReturnType<typeof amqp.connect>>;
type AmqpChannel = Awaited<ReturnType<AmqpConnection['createChannel']>>;

let connection: AmqpConnection | null = null;
let channel: AmqpChannel | null = null;

export async function getPersistentChannel(url: string): Promise<AmqpChannel> {
    if (channel) return channel;

    connection = await amqp.connect(url);
    channel = await connection.createChannel();

    console.log('🐑 Persistent channel established');
    return channel;
}

export async function closePersistentChannel() {
    try { await channel?.close(); } catch { }
    try { await connection?.close(); } catch { }
    channel = null;
    connection = null;
}
