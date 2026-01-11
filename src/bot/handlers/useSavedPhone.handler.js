import { STEPS } from "../../core/fsm/steps.js";
import { getSession } from "../../utils/helpers.js";
import { goToStep } from "../../core/fsm/transition.js";
import { renderStep } from "../render/renderStep.js";

export async function useSavedPhoneHandler(ctx) {
  const chatId =
    ctx.chat?.id ??
    ctx.callbackQuery?.message?.chat?.id ??
    ctx.update?.callback_query?.message?.chat?.id;

  const session = getSession(chatId);
  if (session.step !== STEPS.PHONE) return ctx.answerCbQuery();

  if (!session.data.phone) {
    await ctx.answerCbQuery("Номер не знайдено", { show_alert: true });
    return renderStep(ctx, session);
  }

  goToStep(session, STEPS.CONFIRM);
  await ctx.answerCbQuery("✅ Використовую збережений номер");
  return renderStep(ctx, session);
}
