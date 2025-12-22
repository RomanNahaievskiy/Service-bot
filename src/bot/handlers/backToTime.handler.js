import { STEPS } from "../../core/fsm/steps.js";
import { getSession } from "../../utils/helpers.js";
import { Markup } from "telegraf";

export async function backToTimeHandler(ctx) {
  console.log("⏰ backToTimeHandler", ctx.callbackQuery.data); //test
  const session = getSession(ctx.chat.id);

  session.step = STEPS.TIME; // Повертаємося до вибору часу але не видаляємо з сесії вибраний час

  await ctx.answerCbQuery(); // Підтвердження обробки колбеку для телеграма

  await ctx.editMessageText(
    "⏰ Оберіть зручний час:",
    Markup.inlineKeyboard([
      [Markup.button.callback("⏰ Обрати час", "TIME_SELECT")],
      [Markup.button.callback("⬅️ Назад", "BACK_TO_DATE")],
    ])
  );
}
