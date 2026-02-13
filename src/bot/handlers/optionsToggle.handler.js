import { STEPS } from "../../core/fsm/steps.js";
import { getSession } from "../../utils/helpers.js";
import { renderStep } from "../render/renderStep.js";

export async function optionsToggleHandler(ctx) {
  console.log("🔘 optionsToggleHandler", ctx.callbackQuery.data);

  const chatId =
    ctx.chat?.id ??
    ctx.callbackQuery?.message?.chat?.id ??
    ctx.update?.callback_query?.message?.chat?.id;

  const session = getSession(chatId);

  // FSM guard
  if (session.step !== STEPS.OPTIONS) {
    return ctx.answerCbQuery();
  }

  const optionId = ctx.callbackQuery.data.replace("OPT_TOGGLE_", "");

  session.data.optionIds ??= [];

  const idx = session.data.optionIds.indexOf(optionId);

  if (idx >= 0) {
    // ❌ вимикаємо
    session.data.optionIds.splice(idx, 1);
  } else {
    // ✅ вмикаємо
    session.data.optionIds.push(optionId);
  }

  await ctx.answerCbQuery();

  // просто перемальовуємо той самий крок
  return renderStep(ctx, session);
}
