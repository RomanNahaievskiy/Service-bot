import { STEPS } from "../../core/fsm/steps.js";
import { getSession } from "../../utils/helpers.js";
import { goToStep } from "../../core/fsm/transition.js";
import { renderStep } from "../render/renderStep.js";

export async function optionsDoneHandler(ctx) {
  console.log("✅ optionsDoneHandler");

  const session = getSession(ctx.chat.id);

  // guard
  if (session.step !== STEPS.OPTIONS) {
    return ctx.answerCbQuery();
  }

  // Якщо у тебе tanker і треба ще 1 крок (наприклад "внутрішня мийка 1/2/3 секції"),
  // то тут можна зробити розгалуження:
  // if (session.data.vehicleGroup === "tanker") goToStep(session, STEPS.TANKER_INSIDE);
  // else goToStep(session, STEPS.VEHICLE_DATA);

  goToStep(session, STEPS.VEHICLE_DATA);

  await ctx.answerCbQuery();
  return renderStep(ctx, session);
}
