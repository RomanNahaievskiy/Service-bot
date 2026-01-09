import { renderStep } from "../render/renderStep.js";
import { getSession } from "../../utils/helpers.js";
import { restoreData } from "../../core/fsm/transition.js";

export async function backHandler(ctx) {
  console.log("⬅️ BACK pressed");
  // безпечно отримуємо chatId
  const chatId = ctx.chat?.id ?? ctx.from?.id;
  if (!chatId) return;
  // отримуємо сесію користувача
  const session = getSession(chatId);

  // якщо ти не прокидаєш session через ctx — беремо напряму
  // const session = getSession(ctx.chat.id);

  if (!session || !session.history || session.history.length === 0) {
    return ctx.answerCbQuery("⛔ Немає куди повертатись");
  }

  const prev = session.history.pop();

  session.step = prev.step;
  // session.data = prev.data;
  session.data = restoreData(prev.data);

  //було : await ctx.answerCbQuery();
  // стало :
  if (ctx.callbackQuery) await ctx.answerCbQuery();

  return renderStep(ctx, session);
}
