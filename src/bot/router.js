import { startHandler } from "./handlers/start.handler.js";

export function registerRoutes(bot) {
  bot.start(startHandler);

  // далі підключимо:
  // bot.action(...)
  // bot.on('text', ...)
}
