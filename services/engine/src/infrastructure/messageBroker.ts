// services/engine/src/messageBroker.ts
import { env } from '@bridgepoint/env';
import { getPersistentChannel } from '@bridgepoint/mb-adapter';
import { CasePayload } from '@bridgepoint/types';
import { randomUUID } from 'crypto';

const CASE_QUEUE = 'case_queue';
const DB_RPC_QUEUE = 'db_action_queue';

export const initMessageBroker = async () => {
    const channel: any = await getPersistentChannel(env.MESSAGE_BROKER_URL!);
    const pendingResponses: Map<string, (data: any) => void> = new Map();

    // reply-to consumer (יחיד)
    await channel.consume('amq.rabbitmq.reply-to', (msg: any) => {
        if (!msg) return;
        const correlationId = msg.properties.correlationId;
        const resolve = pendingResponses.get(correlationId);
        if (resolve) {
            resolve(JSON.parse(msg.content.toString()));
            pendingResponses.delete(correlationId);
        }
    }, { noAck: true });

    // queues
    await channel.assertQueue(CASE_QUEUE, { durable: true });
    await channel.assertQueue(DB_RPC_QUEUE, { durable: true });
    console.log(`✅ Queues ready`);

    // consume cases
    await channel.consume(CASE_QUEUE, async (msg: any) => {
        if (!msg) return;

        const caseData: CasePayload = JSON.parse(msg.content.toString());
        await handleCaseMessage(channel, pendingResponses, caseData);

        channel.ack(msg);
    }, { noAck: false });

    // example publish (כמו שהיה)
    publishCase(channel, {
        caseId: 'case-001',
        user1: '68959594ca8706a2a51b7467',
        user2: '68959594ca8706a2a51b7467',
        timestamp: Date.now(),
        sideA: {
            title: 'Vacation in Hawaii',
            arguments: [
                'Great waves for surfing',
                'There is a special deal with El Al',
                'My friends are going there too'
            ]
        },
        sideB: {
            title: 'Vacation in Madagascar',
            arguments: [
                'Less crowded and commercialized',
                'Cheaper overall',
                'Stable weather this season'
            ]
        }
    });
};

function publishCase(channel: any, payload: CasePayload) {
    channel.sendToQueue(CASE_QUEUE, Buffer.from(JSON.stringify(payload)), { persistent: true });
    console.log(`📤 Case published to ${CASE_QUEUE}`);
}

async function handleCaseMessage(
    channel: any,
    pendingResponses: Map<string, (data: any) => void>,
    caseData: CasePayload
) {
    console.log('📥 Handling case:', caseData.caseId);

    const existing = await sendDbCommand(channel, pendingResponses, {
        action: 'find',
        collection: 'cases',
        payload: { caseId: caseData.caseId }
    });

    if (Array.isArray(existing) && existing.length === 0) {
        console.log('🆕 Case not found, inserting');
        const insertResult = await sendDbCommand(channel, pendingResponses, {
            action: 'insert',
            collection: 'cases',
            payload: caseData
        });
        console.log('✅ Insert result:', insertResult);
    } else {
        console.log('⚠️ Case already exists, skipping insert');
    }
}

function sendDbCommand(
    channel: any,
    pendingResponses: Map<string, (data: any) => void>,
    command: any
): Promise<any> {
    const correlationId = randomUUID();

    return new Promise((resolve) => {
        pendingResponses.set(correlationId, resolve);

        channel.sendToQueue(
            DB_RPC_QUEUE,
            Buffer.from(JSON.stringify(command)),
            { replyTo: 'amq.rabbitmq.reply-to', correlationId }
        );
    });
}
