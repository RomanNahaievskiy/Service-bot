// import { STEPS } from "../../core/fsm/steps.js";
// // import { goToStep } from "../../core/fsm/transition.js";
// import { getSession, resetSession } from "../../utils/helpers.js";
// import { setStep } from "../../core/fsm/transition.js";
// import { renderStep } from "../render/renderStep.js";

// export async function startOverHandler(ctx) {
//   console.log("🔄 startOverHandler"); //test

//   resetSession(ctx.chat.id); // Скидаємо сесію користувача

//   const chatId =
//     ctx.chat?.id ??
//     ctx.callbackQuery?.message?.chat?.id ??
//     ctx.update?.callback_query?.message?.chat?.id;

//   const session = getSession(chatId);

//   // Встановлюємо крок на SERVICE
//   setStep(session, STEPS.SERVICE);

//   session.data.fullName ??=
//     ctx.from.first_name + (ctx.from.last_name ? " " + ctx.from.last_name : "");

//   // безпечно відповісти на callback, якщо він є
//   if (ctx.callbackQuery) await ctx.answerCbQuery(); // це і перезаписує ?

//   return renderStep(ctx, session);
// }

//========================================================================================================================================================

import { Markup } from "telegraf";
import { STEPS } from "../../core/fsm/steps.js";
import { getSession, resetSession } from "../../utils/helpers.js";
import { setStep } from "../../core/fsm/transition.js";
import { SERVICES } from "../../core/domain/services.js";

export async function startOverHandler(ctx) {
  console.log("🔄 startOverHandler");

  const chatId =
    ctx.chat?.id ??
    ctx.callbackQuery?.message?.chat?.id ??
    ctx.update?.callback_query?.message?.chat?.id;

  resetSession(chatId); //???

  const session = getSession(chatId);
  setStep(session, STEPS.SERVICE);

  session.data.fullName ??=
    ctx.from.first_name + (ctx.from.last_name ? " " + ctx.from.last_name : "");

  if (ctx.callbackQuery) await ctx.answerCbQuery();

  // ✅ Створюємо НОВЕ повідомлення для нового запису (DONE не чіпаємо)
  const services = Object.values(SERVICES);
  const buttons = services.map((s) => [
    Markup.button.callback(s.title, `SERVICE_${s.id.toUpperCase()}`),
  ]);

  // якщо хочеш кнопку назад/на початок — додай
  // buttons.push([Markup.button.callback("↩️ На початок", "START_OVER")]);

  return ctx.reply(
    "🆕 Новий запис. Оберіть послугу:",
    Markup.inlineKeyboard(buttons)
  );
}
