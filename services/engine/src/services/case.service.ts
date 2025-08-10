import { channel } from '../infrastructure/messageBroker.js';
import { CasePayload } from '@bridgepoint/types';
import { randomUUID } from 'crypto';

const CASE_QUEUE = 'case_queue';
const DB_RPC_QUEUE = 'db_action_queue';

class CaseService {
    private pendingResponses: Map<string, (data: any) => void> = new Map();

    constructor() {
        channel.consume('amq.rabbitmq.reply-to', (msg) => {
            if (!msg) return;
            const correlationId = msg.properties.correlationId;
            const resolve = this.pendingResponses.get(correlationId);
            if (resolve) {
                resolve(JSON.parse(msg.content.toString()));
                this.pendingResponses.delete(correlationId);
            }
        }, { noAck: true });
    }

    async initQueue() {
        await channel.assertQueue(CASE_QUEUE, { durable: true });
        await channel.assertQueue(DB_RPC_QUEUE, { durable: true });
        console.log(`✅ Queues ready`);
    }

    async consumeCases() {
        channel.consume(CASE_QUEUE, async (msg) => {
            if (!msg) return;

            const caseData: CasePayload = JSON.parse(msg.content.toString());
            await this.handleCaseMessage(caseData);

            channel.ack(msg);
        });
    }

    async publishCase(payload: CasePayload) {
        channel.sendToQueue(CASE_QUEUE, Buffer.from(JSON.stringify(payload)), {
            persistent: true,
        });

        console.log(`📤 Case published to ${CASE_QUEUE}`);
    }

    private async handleCaseMessage(caseData: CasePayload) {
        console.log('📥 Handling case:', caseData.caseId);

        const existing = await this.sendDbCommand({
            action: 'find',
            collection: 'cases',
            payload: { caseId: caseData.caseId }
        });

        if (Array.isArray(existing) && existing.length === 0) {
            console.log('🆕 Case not found, inserting');
            const insertResult = await this.sendDbCommand({
                action: 'insert',
                collection: 'cases',
                payload: caseData
            });
            console.log('✅ Insert result:', insertResult);
        } else {
            console.log('⚠️ Case already exists, skipping insert');
        }
    }

    async sendDbCommand(command: any): Promise<any> {
        const correlationId = randomUUID();

        return new Promise((resolve) => {
            this.pendingResponses.set(correlationId, resolve);

            channel.sendToQueue(DB_RPC_QUEUE, Buffer.from(JSON.stringify(command)), {
                replyTo: 'amq.rabbitmq.reply-to',
                correlationId
            });
        });
    }

}

export const caseService = new CaseService();
