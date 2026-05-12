import { STEPS } from "../../core/fsm/steps.js";
import { getSession } from "../../utils/helpers.js";
import { goToStep } from "../../core/fsm/transition.js";
import { renderStep } from "../render/renderStep.js";
import { getFreeDaySlots } from "../../core/domain/slots.js";

export async function datePickHandler(ctx) {
  const chatId =
    ctx.chat?.id ??
    ctx.callbackQuery?.message?.chat?.id ??
    ctx.update?.callback_query?.message?.chat?.id;

  const session = getSession(chatId);

  if (session.step !== STEPS.DATE) {
    return ctx.answerCbQuery();
  }

  // DATE_2026-01-16
  const m = ctx.callbackQuery?.data?.match(/^DATE_(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) {
    await ctx.answerCbQuery("❌ Невірна дата", { show_alert: true });
    return;
  }

  const date = new Date(
    Number(m[1]),
    Number(m[2]) - 1,
    Number(m[3]),
    0,
    0,
    0,
    0,
  );
  session.data.date = date;

  // 🧮 одразу рахуємо слоти
  const durationMin = Number(session.data?.pricing?.totalDurationMin || 30);

  try {
    const slots = await getFreeDaySlots({
      forDate: date,
      serviceDuration: durationMin,
    });

    session.data.timeSlots = slots;
    session.data.timePage = 0;

    session.data.timeSlotsError = null;
  } catch (e) {
    console.error("❌ getFreeDaySlots failed", e);
    session.data.timeSlots = [];
    session.data.timePage = 0; // ✅ теж скидаємо
    session.data.timeSlotsError = String(e?.message || e);
  }

  await ctx.answerCbQuery("✅ Дата обрана");

  goToStep(session, STEPS.TIME);
  return renderStep(ctx, session);
}
