// rpcClient.ts
import type { Channel, ConsumeMessage } from 'amqplib';
import { randomUUID } from 'crypto';

type Resolver = (data: any) => void;
type Rejecter = (err: any) => void;

export class RpcClient {
    private pending = new Map<string, { resolve: Resolver; reject: Rejecter; timer: NodeJS.Timeout }>();
    private replyConsumerReady = false;

    constructor(private ch: Channel) { }

    private ensureReplyConsumer() {
        if (this.replyConsumerReady) return;
        // Only ONE consumer per channel for direct-reply-to
        this.ch.consume('amq.rabbitmq.reply-to', (msg: ConsumeMessage | null) => {
            if (!msg) return;
            const cid = msg.properties.correlationId;
            if (!cid) return;

            const entry = this.pending.get(cid);
            if (!entry) return;

            clearTimeout(entry.timer);
            this.pending.delete(cid);

            try {
                const data = JSON.parse(msg.content.toString());
                entry.resolve(data);
            } catch (e) {
                entry.reject(e);
            }
        }, { noAck: true });

        this.replyConsumerReady = true;
    }

    request<TReq, TRes>(queue: string, payload: TReq, timeoutMs = 14000): Promise<TRes> {
        this.ensureReplyConsumer();
        const correlationId = randomUUID();

        return new Promise<TRes>((resolve, reject) => {
            const timer = setTimeout(() => {
                this.pending.delete(correlationId);
                reject(new Error(`RPC timeout after ${timeoutMs}ms`));
            }, timeoutMs);

            this.pending.set(correlationId, { resolve, reject, timer });

            this.ch.sendToQueue(
                queue,
                Buffer.from(JSON.stringify(payload)),
                { replyTo: 'amq.rabbitmq.reply-to', correlationId }
            );
        });
    }
}
