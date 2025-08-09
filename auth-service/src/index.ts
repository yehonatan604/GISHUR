import { initMessageBroker } from "./infrastructure/messageBroker.js";
import { initAuthListener } from "./listeners/authListener.js";

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
