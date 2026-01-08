import { STEPS } from "../../core/fsm/steps.js";
import { getSession } from "../../utils/helpers.js";
// import { Markup } from "telegraf";
import { askPhoneHandler } from "./askPhone.handler.js";

export async function timeSelectHandler(ctx) {
  // Новий обробник для підтвердження вибору часу
  console.log("⏰ timeSelectHandler", ctx.callbackQuery.data); //test

  const session = getSession(ctx.chat.id);
  const time = ctx.callbackQuery.data.replace("TIME_", "");

  if (session.step !== STEPS.TIME) {
    return ctx.answerCbQuery();
  }

  session.data.time = time;
  session.step = STEPS.PHONE; // Переходимо до отримання номеру тел клієнта

  await ctx.answerCbQuery(); // Підтвердження обробки колбеку для телеграма

  await askPhoneHandler(ctx); // Викликаємо обробник запиту номера телефону
}
