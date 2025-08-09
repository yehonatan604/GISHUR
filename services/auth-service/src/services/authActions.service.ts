import amqp from 'amqplib';
import { hashPassword } from './hash.service.js';
import { randomUUID } from 'crypto';

export class AuthActionsService {
    private static instance: AuthActionsService;

    private constructor(private channel: amqp.Channel) { }

    public static getInstance(channel: amqp.Channel): AuthActionsService {
        if (!AuthActionsService.instance) {
            AuthActionsService.instance = new AuthActionsService(channel);
        }
        return AuthActionsService.instance;
    }

    async login(email: string, password: string): Promise<string> {
        const correlationId = randomUUID();

        const { queue: replyQueue } = await this.channel.assertQueue('', {
            exclusive: true
        });

        const hashed = await hashPassword(password);

        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error('Timeout waiting for login response'));
            }, 5000); // 5 שניות

            this.channel.consume(
                replyQueue,
                msg => {
                    if (!msg) return;

                    if (msg.properties.correlationId === correlationId) {
                        clearTimeout(timeout);
                        const response = JSON.parse(msg.content.toString());
                        resolve(response.token);
                    }
                },
                { noAck: true }
            );

            this.channel.sendToQueue(
                'auth_action_queue',
                Buffer.from(JSON.stringify({
                    type: 'login',
                    email,
                    password: hashed
                })),
                {
                    replyTo: replyQueue,
                    correlationId
                }
            );
        });
    }
}
