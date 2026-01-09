import { STEPS } from "../../core/fsm/steps.js";
import { getSession } from "../../utils/helpers.js";
import { goToStep } from "../../core/fsm/transition.js";
import { renderStep } from "../render/renderStep.js";

export async function vehicleTypeHandler(ctx) {
  console.log("🚗 vehicleTypeHandler", ctx.callbackQuery.data); //  test
  const session = getSession(ctx.chat.id);

  if (session.step !== STEPS.VEHICLE_TYPE) return ctx.answerCbQuery();

  session.data.vehicleId = ctx.callbackQuery.data.replace("VEH_", "");

  goToStep(session, STEPS.OPTIONS);

  await ctx.answerCbQuery();
  return renderStep(ctx, session);
}
