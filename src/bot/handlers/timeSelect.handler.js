import { STEPS } from "../../core/fsm/steps.js";
import { goToStep } from "../../core/fsm/transition.js";
import { getSession } from "../../utils/helpers.js";
import { renderStep } from "../render/renderStep.js";
// import { Markup } from "telegraf";
// import { askPhoneHandler } from "./askPhone.handler.js";
/*Зберігає в сесію обраний час з слотів*/
export async function timeSelectHandler(ctx) {
  // Новий обробник для підтвердження вибору часу
  console.log("⏰ timeSelectHandler", ctx.callbackQuery.data); //test

  const session = getSession(ctx.chat.id);
  if (session.step !== STEPS.TIME) {
    return ctx.answerCbQuery();
  }

  const time = ctx.callbackQuery.data.replace("TIME_", "").trim();
  session.data.time = time;

  // Переходимо до отримання номеру тел клієнта
  goToStep(session, STEPS.PHONE);

  await ctx.answerCbQuery(); // Підтвердження обробки колбеку для телеграма

  return renderStep(ctx, session);
  //await askPhoneHandler(ctx); // Викликаємо обробник запиту номера телефону
}
