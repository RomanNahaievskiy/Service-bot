import { STEPS } from "../../core/fsm/steps.js";
import { getSession, resetSession } from "../../utils/helpers.js";
import { Markup } from "telegraf";

export async function startOverHandler(ctx) {
  console.log("🔄 startOverHandler"); //test

  resetSession(ctx.chat.id); // Скидаємо сесію користувача

  await ctx.answerCbQuery(); // Підтвердження обробки колбеку для телеграма

  const session = getSession(ctx.chat.id);
  session.step = STEPS.SERVICE; // Встановлюємо крок на SERVICE
  session.data ??= {}; //ініціалізуємо дані сесії, якщо вони не існують
  session.data.fullName ??=
    ctx.from.first_name + (ctx.from.last_name ? " " + ctx.from.last_name : "");

  await ctx.reply(
    "🔄 Починаємо спочатку.\n\nОберіть послугу:",
    Markup.inlineKeyboard([
      [Markup.button.callback("🚿 Мийка", "SERVICE_WASH")],
      [Markup.button.callback("✨ Детейлінг", "SERVICE_DETAILING")],
      [Markup.button.callback("🔧 Ремонт", "SERVICE_REPAIR")],
    ])
  );
}
