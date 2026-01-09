import { STEPS } from "../../core/fsm/steps.js";
import { getSession } from "../../utils/helpers.js";
import { getServiceByCallback } from "../../core/domain/services.js";
import { goToStep } from "../../core/fsm/transition.js";
import { renderStep } from "../render/renderStep.js";
// Обробник вибору послуги
export async function serviceHandler(ctx) {
  console.log("🔥 serviceHandler", ctx.callbackQuery.data);

  const session = getSession(ctx.chat.id);
  const callbackData = ctx.callbackQuery.data; // те що обрав користувач

  // FSM guard (опційно, але бажано)
  if (session.step !== STEPS.SERVICE) {
    return ctx.answerCbQuery();
  }

  const service = getServiceByCallback(callbackData);

  if (!service) {
    return ctx.answerCbQuery("❌ Невідома послуга");
  }

  // 1️⃣ зберігаємо дані
  session.data.serviceId = service.id;
  session.data.service = service; // тимчасово, можна залишити тільки id

  // 2️⃣ змінюємо стан з допомогою transition
  goToStep(session, STEPS.VEHICLE_GROUP);
  await ctx.answerCbQuery();

  // 3️⃣ універсальний рендер
  return renderStep(ctx, session);
}
