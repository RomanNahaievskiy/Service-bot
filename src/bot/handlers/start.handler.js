import { STEPS } from "../../core/fsm/steps.js";
import { getSession, resetSession } from "../../utils/helpers.js";
import { renderStep } from "../render/renderStep.js";

export async function startHandler(ctx) {
  console.log("🚀 /start");

  // скидаємо сесію під цього користувача
  resetSession(ctx.chat.id);

  const session = getSession(ctx.chat.id);

  // стартовий крок сценарію
  session.step = STEPS.SERVICE;

  // щоб не було "нема куди назад"
  session.history = [];

  return renderStep(ctx, session);
}
