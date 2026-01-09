import { Markup } from "telegraf";
import { safeEditOrReply } from "./safeEditOrReply.js";
import { SERVICES } from "../../core/domain/services.js";

/**
 * Рендер кроку вибору послуги
 * Джерело: core/domain/services.js (статичні послуги)
 */
export async function renderService(ctx, session) {
  const services = Object.values(SERVICES);

  const buttons = services.map((s) => [
    Markup.button.callback(s.title, `SERVICE_${s.id.toUpperCase()}`),
  ]);

  buttons.push([Markup.button.callback("↩️ На початок", "START_OVER")]);

  return safeEditOrReply(
    ctx,
    "🧽 Оберіть послугу:",
    Markup.inlineKeyboard(buttons)
  );
}
