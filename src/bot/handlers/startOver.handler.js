import { STEPS } from "../../core/fsm/steps.js";
import { getSession, resetSession } from "../../utils/helpers.js";
import { setStep } from "../../core/fsm/transition.js";
import { renderStep } from "../render/renderStep.js";

export async function startOverHandler(ctx) {
  console.log("🔄 startOverHandler"); //test

  resetSession(ctx.chat.id); // Скидаємо сесію користувача

  await ctx.answerCbQuery(); // Підтвердження обробки колбеку для телеграма

  const session = getSession(ctx.chat.id);

  // Встановлюємо крок на SERVICE
  setStep(session, STEPS.SERVICE);

  session.data.fullName ??=
    ctx.from.first_name + (ctx.from.last_name ? " " + ctx.from.last_name : "");

  // безпечно відповісти на callback, якщо він є
  if (ctx.callbackQuery) await ctx.answerCbQuery();

  // ✅ ключ: створюємо нове повідомлення, яке далі будемо редагувати
  await ctx.reply("🆕 Новий запис. Оберіть послугу:");
  return renderStep(ctx, session);
}

//========================================================================================================================================================
