import { STEPS } from "../../core/fsm/steps.js";
import { getSession } from "../../utils/helpers.js";
import { renderStep } from "../render/renderStep.js";
import { getFreeDaySlots } from "../../core/domain/slots.js";
import { BUSINESS_CONFIG } from "../../config/business.config.js";
import { ymdFromDateLike } from "../../utils/timezone.js";

function toDate(val) {
  if (!val) return null;
  if (val instanceof Date) return val;

  // якщо зберіг як "YYYY-MM-DD"
  if (typeof val === "string") {
    // робимо Date в локальному часі (важливо для Europe/Kyiv)
    const m = val.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (m) {
      const [_, y, mo, d] = m;
      return new Date(Number(y), Number(mo) - 1, Number(d), 0, 0, 0, 0);
    }
    const dt = new Date(val);
    return Number.isNaN(dt.getTime()) ? null : dt;
  }

  // якщо зберіг як число (timestamp)
  if (typeof val === "number") {
    const dt = new Date(val);
    return Number.isNaN(dt.getTime()) ? null : dt;
  }

  // якщо зберіг як {year,month,day} тощо — підлаштуємо
  if (typeof val === "object") {
    if ("time" in val) {
      const dt = new Date(val.time);
      return Number.isNaN(dt.getTime()) ? null : dt;
    }
  }

  return null;
}

export async function timeHandler(ctx) {
  console.log("⏰ timeHandler", ctx.callbackQuery?.data);

  const chatId =
    ctx.chat?.id ??
    ctx.callbackQuery?.message?.chat?.id ??
    ctx.update?.callback_query?.message?.chat?.id;

  const session = getSession(chatId);

  // FSM guard
  if (session.step !== STEPS.TIME) {
    return ctx.answerCbQuery();
  }

  // Нормалізуємо дату
  let date = null;
  try {
    date = ymdFromDateLike(session.data?.date, BUSINESS_CONFIG.TIME_ZONE);
  } catch {
    date = null;
  }

  if (!date) {
    await ctx.answerCbQuery("❌ Спочатку оберіть дату", { show_alert: true });
    // краще повернути назад, а не reply /start
    // якщо BACK у тебе працює — просто рендерни поточний step назад кнопкою
    return ctx.editMessageText("📅 Будь ласка, оберіть дату ще раз.");
  }

  // Тривалість беремо з прайсу, fallback = 30
  const durationMin = Number(session.data?.pricing?.totalDurationMin || 30);

  try {
    console.log("🧩 getFreeDaySlots args:", {
      dateISO: date,
      durationMin,
    });

    const slots = await getFreeDaySlots({
      forDate: date,
      serviceDuration: durationMin,
    });

    console.log(
      "🧩 slots found:",
      Array.isArray(slots) ? slots.length : "not array"
    );

    session.data.timeSlots = Array.isArray(slots) ? slots : [];
    session.data.timeSlotsError = null;
  } catch (e) {
    console.error("❌ getFreeDaySlots failed", e);
    session.data.timeSlots = [];
    session.data.timeSlotsError = String(e?.message || e);
  }

  await ctx.answerCbQuery();
  return renderStep(ctx, session);
}
