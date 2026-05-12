console.log("🚀 MY APP STARTED");

import express from "express";
import path from "path";
import { fileURLToPath } from "url";

import { startBot } from "./bot/index.js";
import { initDB } from "./db/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function bootstrap() {
  try {
    await initDB();

    const app = express();
    const PORT = process.env.PORT || 3000;

    app.use(express.json());

    app.use(
      "/wash-board",
      express.static(path.join(__dirname, "public", "wash-board")),
    );

    app.get("/healthz", (req, res) => {
      res.json({ ok: true });
    });

    app.listen(PORT, () => {
      console.log(`🌐 Web server started on port ${PORT}`);
    });

    await startBot();

    console.log("✅ App started successfully");
  } catch (err) {
    console.error("❌ App start failed", err);
    process.exit(1);
  }
}

bootstrap();
