import { initAuthListener } from "./infrastructure/messageBroker.js";

(async () => {
    try {
        await initAuthListener();
        console.log("✅ Auth service initialized successfully");
    } catch (err) {
        console.error("❌ Failed to init auth listener:", err);
        process.exit(1);
    }
})();
