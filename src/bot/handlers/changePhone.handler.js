import { STEPS } from "../../core/fsm/steps.js";
import { getSession } from "../../utils/helpers.js";
import { renderStep } from "../render/renderStep.js";

export async function changePhoneHandler(ctx) {
  const chatId =
    ctx.chat?.id ??
    ctx.callbackQuery?.message?.chat?.id ??
    ctx.update?.callback_query?.message?.chat?.id;

  const session = getSession(chatId);
  if (session.step !== STEPS.PHONE) return ctx.answerCbQuery();

  // Скидаємо збережений номер саме в сесії, щоб показати кнопку contactRequest
  session.data.phone = "";
  await ctx.answerCbQuery("✏️ Добре, надішліть новий номер");
  return renderStep(ctx, session);
}
