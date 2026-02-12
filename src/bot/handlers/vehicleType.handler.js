import { STEPS } from "../../core/fsm/steps.js";
import { getSession } from "../../utils/helpers.js";
import { goToStep } from "../../core/fsm/transition.js";
import { renderStep } from "../render/renderStep.js";

export async function vehicleTypeHandler(ctx) {
  console.log("🚗 vehicleTypeHandler", ctx.callbackQuery.data); //  test
  const session = getSession(ctx.chat.id);

  if (session.step !== STEPS.VEHICLE_TYPE) return ctx.answerCbQuery();
  //

  const vehicleId = ctx.callbackQuery.data.replace("VEH_", "");
  session.data.vehicleId = vehicleId;

  session.data.vehicleTitle =
    session.data?.prices?.vehicles?.find((v) => v.vehicleId === vehicleId)
      ?.vehicleTitle ||
    session.data.vehicleTitle ||
    "—";

  goToStep(session, STEPS.OPTIONS);

  await ctx.answerCbQuery();
  return renderStep(ctx, session);
}
