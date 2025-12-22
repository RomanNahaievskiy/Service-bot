import { startBot } from "./bot/index.js";
import { initDB } from "./db/index.js";

async function bootstrap() {
  try {
    await initDB();
    await startBot();
    console.log("✅ App started successfully");
  } catch (err) {
    console.error("❌ App start failed", err);
    process.exit(1);
  }
}

bootstrap();
