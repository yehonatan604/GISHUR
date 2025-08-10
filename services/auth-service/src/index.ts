import { initMessageBroker } from "./infrastructure/messageBroker.js";

(async () => {
    try {
        await initMessageBroker();
        console.log("✅ Auth service initialized successfully");
    } catch (err) {
        console.error("❌ Failed to init auth listener:", err);
        process.exit(1);
    }
})();
