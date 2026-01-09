import { STEPS } from "../../core/fsm/steps.js";
import { goToStep } from "../../core/fsm/transition.js";
import { getSession } from "../../utils/helpers.js";
import { renderStep } from "../render/renderStep.js";

export async function vehicleDataHandler(ctx) {
  const session = getSession(ctx.chat.id);

  // ❗ Приймаємо текст ТІЛЬКИ якщо FSM у правильному стані (щоб захистити сценарій)
  if (session.step !== STEPS.VEHICLE_DATA) {
    return;
  }

  const vehicleNumber = ctx.message.text.trim();

  // Мінімальна валідація
  if (vehicleNumber.length < 3) {
    return ctx.reply("❌ Некоректний номер. Спробуйте ще раз:"); // повідомляємо користувача про помилку новим повідомленням (не замінюємо контекст)
  }

  session.data.vehicleNumber = vehicleNumber;

  // переходимо до кроку вибору дати
  goToStep(session, STEPS.DATE);

  return renderStep(ctx, session);
}
