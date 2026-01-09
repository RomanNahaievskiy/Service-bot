import { STEPS } from "../../core/fsm/steps.js";
import { goToStep } from "../../core/fsm/transition.js";
import { getSession } from "../../utils/helpers.js";
import { renderStep } from "../render/renderStep.js";

export async function vehicleGroupHandler(ctx) {
  console.log("🚗 vehicleGroupHandler", ctx.callbackQuery.data); // test

  const session = getSession(ctx.chat.id);
  const callbackData = ctx.callbackQuery.data;

  // FSM guard
  if (session.step !== STEPS.VEHICLE_GROUP) {
    return ctx.answerCbQuery();
  }

  // GROUP_PASSENGER / GROUP_CARGO / GROUP_TANKER / GROUP_OTHER
  const group = callbackData.replace("GROUP_", "").toLowerCase();

  // мінімальна валідація (можливо варто аби дані приходили з sheetApi)
  const allowedGroups = ["passenger", "cargo", "tanker", "other"];
  if (!allowedGroups.includes(group)) {
    return ctx.answerCbQuery("❌ Невідомий тип транспорту");
  }

  // зберігаємо вибір
  session.data.vehicleGroup = group;

  // логіка переходу
  if (group === "other") {
    goToStep(session, STEPS.OTHER_CONTACT);
  } else {
    goToStep(session, STEPS.VEHICLE_TYPE);
  }

  await ctx.answerCbQuery();

  // універсальний рендер
  return renderStep(ctx, session);
}
