import nodemailer, { Transporter, SendMailOptions } from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport/index.js";
import { env } from "../env.js";

const {
    MAIL_HOST,
    MAIL_PASS,
    MAIL_PORT,
    MAIL_PROVIDER,
    MAIL_USER,
} = env;

const transporter: Transporter<SMTPTransport.SentMessageInfo> =
    nodemailer.createTransport({
        service: MAIL_PROVIDER,
        host: MAIL_HOST,
        port: MAIL_PORT,
        secure: true,
        auth: {
            user: MAIL_USER,
            pass: MAIL_PASS,
        }
    } as SMTPTransport.Options);

export const sendMail = async (mailOptions: SendMailOptions): Promise<SMTPTransport.SentMessageInfo> => {
    try {
        const info = await transporter.sendMail({
            from: `"BridgePoint" <${MAIL_USER}>`,
            ...mailOptions,
        });
        return info;
    } catch (err) {
        console.log("Error sending email");
        throw err;
    }
};