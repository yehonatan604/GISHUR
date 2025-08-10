import { randomUUID } from "crypto";

type Resolver = (data: any) => void;
type Rejecter = (err: any) => void;

type RpcClientOptions = {
    defaultTimeoutMs?: number;      // ברירת מחדל ל-timeout
    replyQueue?: string;            // אפשרות להחליף את direct-reply-to אם תרצה
};

// שומר צרכן יחיד ל-reply-to לכל Channel; בטוח לקריאה חוזרת.
export class RpcClient {
    private pending = new Map<string, { resolve: Resolver; reject: Rejecter; timer: NodeJS.Timeout }>();
    private replyConsumerReady = false;
    private replyQueue: string;
    private defaultTimeoutMs: number;

    constructor(private ch: any, opts: RpcClientOptions = {}) {
        this.replyQueue = opts.replyQueue ?? "amq.rabbitmq.reply-to";
        this.defaultTimeoutMs = opts.defaultTimeoutMs ?? 14_000;
    }

    private ensureReplyConsumer() {
        if (this.replyConsumerReady) return;

        this.ch.consume(
            this.replyQueue,
            (msg: any) => {
                if (!msg) return;
                const cid = msg.properties?.correlationId;
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
            },
            { noAck: true }
        );

        this.replyConsumerReady = true;
    }

    request<TReq, TRes>(queue: string, payload: TReq, timeoutMs?: number): Promise<TRes> {
        this.ensureReplyConsumer();
        const correlationId = randomUUID();
        const to = timeoutMs ?? this.defaultTimeoutMs;

        return new Promise<TRes>((resolve, reject) => {
            const timer = setTimeout(() => {
                this.pending.delete(correlationId);
                reject(new Error(`RPC timeout after ${to}ms`));
            }, to);

            this.pending.set(correlationId, { resolve, reject, timer });

            this.ch.sendToQueue(
                queue,
                Buffer.from(JSON.stringify(payload)),
                { replyTo: this.replyQueue, correlationId }
            );
        });
    }
}

// helper אופציונלי לשימוש מהיר
export async function rpcRequest<TReq, TRes>(
    ch: any,
    queue: string,
    payload: TReq,
    timeoutMs?: number
): Promise<TRes> {
    const client = new RpcClient(ch);
    return client.request<TReq, TRes>(queue, payload, timeoutMs);
}
