import { STEPS } from "../../core/fsm/steps.js";
// import { goToStep } from "../../core/fsm/transition.js";
import { getSession, resetSession } from "../../utils/helpers.js";
import { setStep } from "../../core/fsm/transition.js";
import { renderStep } from "../render/renderStep.js";

export async function startOverHandler(ctx) {
  console.log("🔄 startOverHandler"); //test

  resetSession(ctx.chat.id); // Скидаємо сесію користувача

  const chatId =
    ctx.chat?.id ??
    ctx.callbackQuery?.message?.chat?.id ??
    ctx.update?.callback_query?.message?.chat?.id;

  const session = getSession(chatId);

  // Встановлюємо крок на SERVICE
  setStep(session, STEPS.SERVICE);

  session.data.fullName ??=
    ctx.from.first_name + (ctx.from.last_name ? " " + ctx.from.last_name : "");

  // безпечно відповісти на callback, якщо він є
  if (ctx.callbackQuery) await ctx.answerCbQuery(); // це і перезаписує ?

  return renderStep(ctx, session);
}

//========================================================================================================================================================
