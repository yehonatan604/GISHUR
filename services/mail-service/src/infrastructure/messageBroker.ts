import amqp, { ConsumeMessage } from 'amqplib';
import { sendMail } from './mailer.js';
import { resetPasswordMail } from '../mails/resetPassword.mail.js';
import { manyAttemptsMail } from '../mails/manyAttempts.mail.js';
import { forgotPasswordrMail } from '../mails/forgotPassword.mail.js';
import { registerMail } from '../mails/register.mail.js';
import { MailFunction, ResetPasswordMailFunction } from '@bridgepoint/types';
import { env } from '@bridgepoint/env';

const QUEUE = 'send_mail_queue';

export const initMessageBroker = async () => {
    const conn = await amqp.connect(env.MESSAGE_BROKER_URL!);
    const channel = await conn.createChannel();

    await channel.assertQueue(QUEUE, { durable: true });
    console.log(`📩 Listening to "${QUEUE}"`);

    channel.consume(QUEUE, async (msg: ConsumeMessage | null) => {
        if (!msg) return;

        try {
            const mailContent = JSON.parse(msg.content.toString());

            const mailFunctions = {
                reset_password: resetPasswordMail,
                many_attempts: manyAttemptsMail,
                forgot_password: forgotPasswordrMail,
                register: registerMail
            }

            const func: MailFunction | ResetPasswordMailFunction = mailFunctions[mailContent.type as keyof typeof mailFunctions];

            const mail = func(
                mailContent.email,
                mailContent.name,
                mailContent.type === 'reset_password' ? mailContent.newPassword : mailContent.token
            );

            const sent = await sendMail(mail);

            console.log('📩 Mail sent:', sent);
            channel.ack(msg);
        } catch (err) {
            console.error('❌ Message handling error:', err);
            channel.nack(msg, false, false);
        }
    });
};
