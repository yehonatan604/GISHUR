import { randomUUID } from "crypto";

type Resolver = (data: any) => void;
type Rejecter = (err: any) => void;

type RpcClientOptions = {
    defaultTimeoutMs?: number;
    replyQueue?: string;
};

export class RpcClient {
    private pending = new Map<string, { resolve: Resolver; reject: Rejecter; timer: NodeJS.Timeout }>();
    private replyConsumerReady = false;
    private replyQueue: string;
    private defaultTimeoutMs: number;

    constructor(private ch: any, opts: RpcClientOptions = {}) {
        this.replyQueue = opts.replyQueue ?? "amq.rabbitmq.reply-to";
        this.defaultTimeoutMs = opts.defaultTimeoutMs ?? 14_000;

        try {
            this.ch.on?.("close", () => this.flushPending(new Error("RPC channel closed")));
            this.ch.on?.("error", (e: any) => this.flushPending(e instanceof Error ? e : new Error(String(e))));
        } catch { }
    }

    private flushPending(err: Error) {
        for (const [cid, entry] of this.pending) {
            clearTimeout(entry.timer);
            entry.reject(err);
            this.pending.delete(cid);
        }
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
                    entry.reject(e instanceof Error ? e : new Error(String(e)));
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
                {
                    replyTo: this.replyQueue,
                    correlationId,
                    expiration: String(to),
                    contentType: "application/json"
                }
            );
        });
    }
}

export const rpcRequest = async <TReq, TRes>(
    ch: any,
    queue: string,
    payload: TReq,
    timeoutMs?: number
): Promise<TRes> => {
    const client = new RpcClient(ch);
    return client.request<TReq, TRes>(queue, payload, timeoutMs);
}
