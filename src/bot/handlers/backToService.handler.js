import { STEPS } from "../../core/fsm/steps.js";
import { getSession } from "../../utils/helpers.js";
import { Markup } from "telegraf";

export async function backToServiceHandler(ctx) {
  console.log(" backToServiceHandler", ctx.callbackQuery.data); //test
  const session = getSession(ctx.chat.id);

  session.step = STEPS.SERVICE; // Повертаємося до вибору послуги
  session.data = {}; // Очищаємо збережені дані

  await ctx.answerCbQuery(); // Підтвердження обробки колбеку для телеграма

  await ctx.editMessageText(
    "Оберіть послугу:",
    Markup.inlineKeyboard([
      [Markup.button.callback("🚿 Мийка", "SERVICE_WASH")],
      [Markup.button.callback("✨ Детейлінг", "SERVICE_DETAILING")],
      [Markup.button.callback("🔧 Ремонт", "SERVICE_REPAIR")],
    ])
  );
}
