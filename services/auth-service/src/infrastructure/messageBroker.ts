// services/auth-service/src/messageBroker.ts
import { env } from "@bridgepoint/env";
import { getPersistentChannel } from "@bridgepoint/mb-adapter";
import { handleLogin } from "../handlers/login.handler.js";
import { handleRegister } from "../handlers/register.handler.js";
import { AuthActionSchema } from "@bridgepoint/zod-schemas";


const QUEUE = "auth_action_queue";

export const initMessageBroker = async () => {
    const ch = await getPersistentChannel(env.MESSAGE_BROKER_URL!);
    await ch.assertQueue(QUEUE, { durable: true });
    try { await ch.prefetch(10); } catch { }
    console.log(`🔐 Listening to "${QUEUE}"`);

    await ch.consume(
        QUEUE,
        async (msg: any) => {
            if (!msg) return;
            const { replyTo, correlationId } = msg.properties || {};
            const reply = (payload: unknown) => {
                if (!replyTo || !correlationId) return;
                ch.sendToQueue(replyTo, Buffer.from(JSON.stringify(payload)), { correlationId });
            };

            try {
                const parsed = AuthActionSchema.safeParse(JSON.parse(msg.content.toString()));
                if (!parsed.success) {
                    reply({ ok: false, error: "Validation failed", details: parsed.error.flatten() });
                    return ch.ack(msg);
                }

                const cmd = parsed.data;

                switch (cmd.type) {
                    case "login": {
                        const res = await handleLogin(ch, cmd.email, cmd.password);
                        reply(res);
                        break;
                    }
                    case "register": {
                        const res = await handleRegister(ch, cmd.email, cmd.password, cmd.firstName, cmd.lastName);
                        reply(res);
                        break;
                    }
                    default:
                        reply({ ok: false, error: "Unsupported action" });
                }
            } catch (e: any) {
                reply({ ok: false, error: "Internal error", details: e?.message });
            } finally {
                ch.ack(msg);
            }
        },
        { noAck: false }
    );
};
