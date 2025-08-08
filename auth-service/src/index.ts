import { initMessageBroker } from "./infrastructure/messageBroker";
import { initAuthListener } from "./listeners/authListener";

(async () => {
    try {
        const channel = await initMessageBroker();
        await initAuthListener(channel);
        console.log("✅ Auth service initialized successfully");
    } catch (err) {
        console.error("❌ Failed to init auth listener:", err);
        process.exit(1);
    }
})();
