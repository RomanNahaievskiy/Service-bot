import { STEPS } from "../../core/fsm/steps.js";
import { getSession } from "../../utils/helpers.js";
import { renderStep } from "../render/renderStep.js";
import { getFreeDaySlots } from "../../core/domain/slots.js";

export async function timeHandler(ctx) {
  console.log("⏰ timeHandler", ctx.callbackQuery?.data); // test

  const session = getSession(ctx.chat.id);

  // FSM guard
  if (session.step !== STEPS.TIME) {
    return ctx.answerCbQuery();
  }

  // Дата має бути вибрана
  if (!(session.data.date instanceof Date)) {
    await ctx.answerCbQuery();
    // якщо дата загубилась — відкотимо назад (або попросимо /start)
    return ctx.reply("❌ Спочатку оберіть дату. Введіть /start");
  }

  // Тривалість беремо з прайсу, fallback = 30
  const durationMin = Number(session.data?.pricing?.totalDurationMin || 30);

  try {
    // Отримаємо тільки вільні слоти
    // Очікуємо, що getFreeDaySlots повертає [{ start:'10:00', end:'10:30', label:'10:00' }, ...]
    const slots = await getFreeDaySlots({
      date: session.data.date,
      serviceDuration: durationMin,
    });

    session.data.timeSlots = slots; // 👈 дані для renderer
  } catch (e) {
    console.error("❌ getFreeDaySlots failed", e);
    session.data.timeSlots = [];
    session.data.timeSlotsError = String(e?.message || e);
  }

  await ctx.answerCbQuery();

  // UI малює renderer
  return renderStep(ctx, session);
}
