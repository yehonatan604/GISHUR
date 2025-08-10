import { env } from '@bridgepoint/env';
import { getPersistentChannel } from '@bridgepoint/mb-adapter';
import { MailFunction, ResetPasswordMailFunction } from '@bridgepoint/types';
import { sendMail } from './mailer.js';
import { resetPasswordMail } from '../mails/resetPassword.mail.js';
import { manyAttemptsMail } from '../mails/manyAttempts.mail.js';
import { forgotPasswordrMail } from '../mails/forgotPassword.mail.js';
import { registerMail } from '../mails/register.mail.js';

const QUEUE = 'send_mail_queue';

export const initMessageBroker = async () => {
    const channel: any = await getPersistentChannel(env.MESSAGE_BROKER_URL!);

    await channel.assertQueue(QUEUE, { durable: true });
    console.log(`📩 Listening to "${QUEUE}"`);

    await channel.consume(
        QUEUE,
        async (msg: any) => {
            if (!msg) return;

            try {
                const mailContent = JSON.parse(msg.content.toString());

                const mailFunctions = {
                    reset_password: resetPasswordMail,
                    many_attempts: manyAttemptsMail,
                    forgot_password: forgotPasswordrMail,
                    register: registerMail
                };

                const func: MailFunction | ResetPasswordMailFunction =
                    mailFunctions[mailContent.type as keyof typeof mailFunctions];

                if (!func) {
                    console.error('❌ Unknown mail type:', mailContent.type);
                    channel.ack(msg);
                    return;
                }

                const mail = func(
                    mailContent.email,
                    mailContent.name,
                    mailContent.type === 'reset_password'
                        ? mailContent.newPassword
                        : mailContent.token
                );

                const sent = await sendMail(mail);
                console.log('📩 Mail sent:', sent);

                channel.ack(msg);
            } catch (err) {
                console.error('❌ Message handling error:', err);
                channel.nack(msg, false, false);
            }
        },
        { noAck: false }
    );
};
