import { Markup } from "telegraf";
import { STEPS } from "../../core/fsm/steps.js";
import { getSession } from "../../utils/helpers.js";

export async function startHandler(ctx) {
  const session = getSession(ctx.chat.id);

  session.step = STEPS.SERVICE;
  session.data = {};

  await ctx.reply(
    "👋 Вітаємо! Цей бот допоможе швидко записатися на послуги.\n\nОберіть послугу:",
    Markup.inlineKeyboard([
      [Markup.button.callback("🚿 Мийка", "SERVICE_WASH")],
      [Markup.button.callback("✨ Детейлінг", "SERVICE_DETAILING")],
      [Markup.button.callback("🔧 Ремонт", "SERVICE_REPAIR")],
    ])
  );
}
