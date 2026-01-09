import { STEPS } from "../../core/fsm/steps.js";
import { getSession } from "../../utils/helpers.js";
import { renderStep } from "../render/renderStep.js";

export async function optionsToggleHandler(ctx) {
  console.log("🔘 optionsToggleHandler", ctx.callbackQuery.data);

  const session = getSession(ctx.chat.id);

  // FSM guard
  if (session.step !== STEPS.OPTIONS) {
    return ctx.answerCbQuery();
  }

  const optionId = ctx.callbackQuery.data.replace("OPT_TOGGLE_", "");

  session.data.options ??= [];

  const idx = session.data.options.indexOf(optionId);

  if (idx >= 0) {
    // ❌ вимикаємо
    session.data.options.splice(idx, 1);
  } else {
    // ✅ вмикаємо
    session.data.options.push(optionId);
  }

  await ctx.answerCbQuery();

  // просто перемальовуємо той самий крок
  return renderStep(ctx, session);
}
