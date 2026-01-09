import { STEPS } from "../../core/fsm/steps.js";
import { setStep } from "../../core/fsm/transition.js";
import { getSession, resetSession } from "../../utils/helpers.js";
import { renderStep } from "../render/renderStep.js";

export async function startHandler(ctx) {
  resetSession(ctx.chat.id);
  const session = getSession(ctx.chat.id);

  // session.step = STEPS.SERVICE;
  setStep(session, STEPS.SERVICE);
  session.history = [];

  return renderStep(ctx, session);
}
