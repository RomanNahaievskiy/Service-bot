import { getSession } from "../../utils/sessionManager.js";
import { STEPS } from "../../config/states.js";
import { goToStep } from "../../utils/sessionSteps.js";
import { renderStep } from "../render/renderStep.js";

export async function contractVehicleSelectHandler(ctx) {
  const chatId = ctx.callbackQuery?.message?.chat?.id;
  const session = getSession(chatId);

  const data = ctx.callbackQuery?.data || "";
  const vehicleNumber = decodeURIComponent(data.replace(/^CVN_/, ""));

  const v = (session.data.contractVehicles || []).find(
    (x) => String(x.vehicleNumber) === String(vehicleNumber),
  );

  if (!v) {
    await ctx.answerCbQuery("ТЗ не знайдено. Оновіть список.", {
      show_alert: true,
    });
    return;
  }

  session.data.vehicleNumber = v.vehicleNumber;
  session.data.vehicleId = v.vehicleId;
  session.data.vehicleTitle = v.alias || v.vehicleNumber;

  await ctx.answerCbQuery("✅ Обрано");
  goToStep(session, STEPS.DATE);
  return renderStep(ctx, session);
}
