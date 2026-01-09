import { Markup } from "telegraf";
import { safeEditOrReply } from "./safeEditOrReply.js";

/**
 * Рендер кроку вибору послуги
 * Очікує:
 * session.data.prices.services (з GAS prices_get)
 */
export async function renderService(ctx, session) {
  const services = session.data?.prices?.services ?? [];

  if (!services.length) {
    return safeEditOrReply(
      ctx,
      "❌ Наразі послуги недоступні. Спробуйте пізніше."
    );
  }

  const buttons = services
    .filter((s) => s.active)
    .map((s) => [Markup.button.callback(s.title, `SERVICE_${s.serviceId}`)]);

  buttons.push([Markup.button.callback("↩️ На початок", "START_OVER")]);

  return safeEditOrReply(
    ctx,
    "🧽 Оберіть послугу:",
    Markup.inlineKeyboard(buttons)
  );
}
