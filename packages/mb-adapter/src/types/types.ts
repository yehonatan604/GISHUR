export type AmqpConnection = import("amqplib").Connection;
export type AmqpChannel = import("amqplib").Channel;

export type RetryOptions = { maxRetries: number; retryDelayMs: number; };
export type Topology = {
    mainEx: string; retryEx: string; dlxEx: string;
    mainQ: string; retryQ: string; dlq: string;
    rkMain: string; rkRetry: string; rkDlq: string;
};