import { env } from '@bridgepoint/env';
import { getPersistentChannel, RpcClient } from '@bridgepoint/mb-adapter';

let rpc: RpcClient | null = null;

export const initMessageBroker = async () => {
    const ch = await getPersistentChannel(env.MESSAGE_BROKER_URL!);
    rpc = new RpcClient(ch, { defaultTimeoutMs: 7_000 }); // אופציונלי
    console.log('✅ Connected to RabbitMQ (Gateway API) using persistent channel');
};

export function getRpcClient(): RpcClient {
    if (!rpc) throw new Error('RabbitMQ not initialized. Call initMessageBroker() first.');
    return rpc;
}
