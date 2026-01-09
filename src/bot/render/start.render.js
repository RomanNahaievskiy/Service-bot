import { Markup } from "telegraf";
import { safeEditOrReply } from "./safeEditOrReply.js";

export async function renderStart(ctx, session) {
  return safeEditOrReply(
    ctx,
    `👋 Вітаю! Я бот запису на мийку KLR-Service.\n\nНатисніть “Почати”, щоб обрати послугу.`,
    Markup.inlineKeyboard([[Markup.button.callback("▶️ Почати", "START_FLOW")]])
  );
}
