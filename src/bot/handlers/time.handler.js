import { STEPS } from "../../core/fsm/steps.js";
import { getSession } from "../../utils/helpers.js";
// import { generateDaySlots } from "../../core/domain/slots.js";
import { getFreeDaySlots } from "../../core/domain/slots.js";
import { BUSINESS_CONFIG } from "../../config/business.config.js";
import { Markup } from "telegraf";

export async function timeHandler(ctx) {
  console.log("⏰ timeHandler", ctx.callbackQuery.data);

  const session = getSession(ctx.chat.id);

  if (session.step !== STEPS.TIME) {
    return ctx.answerCbQuery();
  }

  const forDate = session.data?.date;
  if (!(forDate instanceof Date)) {
    await ctx.answerCbQuery("Спочатку оберіть дату");
    return;
  }

  const service = session.data?.service;
  if (!service?.duration) {
    await ctx.answerCbQuery("Спочатку оберіть послугу");
    return;
  }

  const slots = await getFreeDaySlots({
    serviceDuration: service.duration, // ✅ звідси
    slotStep: BUSINESS_CONFIG.SLOT_STEP_MINUTES, // ✅ крок
    forDate, // ✅ дата
    now: new Date(), // ✅ поточний час
    leadTimeMinutes: 0, // можна 10
  });

  const keyboard = [];
  for (let i = 0; i < slots.length; i += 3) {
    keyboard.push(
      slots
        .slice(i, i + 3)
        .map((slot) => Markup.button.callback(slot.start, `TIME_${slot.start}`))
    );
  }
  keyboard.push([Markup.button.callback("⬅️ Назад", "BACK_TO_DATE")]);

  await ctx.answerCbQuery();

  await ctx.editMessageText(
    "⏰ Оберіть зручний час:",
    Markup.inlineKeyboard(keyboard)
  );
}
