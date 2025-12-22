import { STEPS } from "../../core/fsm/steps.js";
import { getSession } from "../../utils/helpers.js";
import { resolveDateByCallback, formatDate } from "../../core/domain/dates.js";
import { Markup } from "telegraf";

export async function dateHandler(ctx) {
  console.log("📅 dateHandler", ctx.callbackQuery.data); //test

  const session = getSession(ctx.chat.id);
  const callback = ctx.callbackQuery.data;

  // FSM guard
  if (session.step !== STEPS.DATE) {
    return ctx.answerCbQuery();
  }

  const date = resolveDateByCallback(callback);

  if (!date) {
    return ctx.answerCbQuery("Невідома дата");
  }
  session.data ??= {}; //ініціалізуємо дані сесії, якщо вони не існують

  session.data.date = date;
  session.step = STEPS.TIME; // Переходимо до вибору часу

  await ctx.answerCbQuery(); // Підтвердження обробки колбеку для телеграма

  await ctx.editMessageText(
    `📅 Дата обрана: ${formatDate(date)}\n\nОберіть час:`,
    Markup.inlineKeyboard([
      [Markup.button.callback("⏰ Обрати час", "TIME_SELECT")],
      [Markup.button.callback("⬅️ Назад", "BACK_TO_VEHICLE_DATA")],
    ])
  );
}
