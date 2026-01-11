import { STEPS } from "../../core/fsm/steps.js";
import { getSession } from "../../utils/helpers.js";
import { createBooking } from "../../core/domain/bookings.js";
import { goToStep } from "../../core/fsm/transition.js";
import { renderStep } from "../render/renderStep.js";

export async function confirmHandler(ctx) {
  console.log("✅ confirmHandler");

  // const session = getSession(ctx.chat.id);
  const chatId =
    ctx.chat?.id ??
    ctx.callbackQuery?.message?.chat?.id ??
    ctx.update?.callback_query?.message?.chat?.id;

  const session = getSession(chatId);

  if (session.step !== STEPS.CONFIRM) {
    return ctx.answerCbQuery();
  }

  try {
    const booking = await createBooking({
      chatId: ctx.chat.id,
      service: session.data.service, // або serviceId
      vehicle: session.data.vehicle, // або vehicleId
      vehicleNumber: session.data.vehicleNumber,
      date: session.data.date,
      time: session.data.time,
      fullName: session.data.fullName,
      phone: session.data.phone,
      // optionIds теж можеш додати
      optionIds: session.data.optionIds || [],
      pricing: session.data.pricing, // якщо потрібно для запису
    });

    session.data.booking = booking; // ✅ збережемо результат
    session.data.confirmError = null; // ✅ очистимо помилки

    goToStep(session, STEPS.DONE);

    await ctx.answerCbQuery("✅ Запис створено");
    return renderStep(ctx, session);
  } catch (err) {
    console.error("❌ createBooking failed", err);

    session.data.confirmError = String(err?.message || err);
    // НЕ міняємо step — лишаємось в CONFIRM, щоб дати повторити

    await ctx.answerCbQuery("❌ Помилка створення запису", {
      show_alert: true,
    });
    return renderStep(ctx, session); // ✅ renderer покаже помилку і кнопки
  }
}
