import { Telegraf } from "telegraf"; // Import Telegraf library for Telegram bot functionality
import { ENV } from "../config/env.js";
import { registerRoutes } from "./router.js";

export const bot = new Telegraf(ENV.BOT_TOKEN);

export async function startBot() {
  registerRoutes(bot);

  await bot.launch();
  console.log("🤖 Telegram bot launched");

  process.once("SIGINT", () => bot.stop("SIGINT"));
  process.once("SIGTERM", () => bot.stop("SIGTERM"));
}
