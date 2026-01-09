import { Markup } from "telegraf";
import { safeEditOrReply } from "./safeEditOrReply.js";

export async function renderTime(ctx, session) {
  const slots = Array.isArray(session.data.timeSlots)
    ? session.data.timeSlots
    : [];
  const durationMin = Number(session.data?.pricing?.totalDurationMin || 30);

  // Якщо слоти не підвантажені — просимо натиснути кнопку (або просто показати "оновити")
  // (можна прибрати, якщо timeHandler викликається автоматично одразу після dateHandler)
  if (!session.data.timeSlots && slots.length === 0) {
    return safeEditOrReply(
      ctx,
      `⏰ Підбираю вільний час (тривалість: ${durationMin} хв)…`,
      Markup.inlineKeyboard([
        [Markup.button.callback("🔄 Показати слоти", "TIME_SELECT")],
        [Markup.button.callback("⬅️ Назад", "BACK")],
      ])
    );
  }

  // Немає слотів
  if (slots.length === 0) {
    const extraMsg = session.data.timeSlotsError
      ? `\n\n⚠️ ${session.data.timeSlotsError}`
      : "";

    return safeEditOrReply(
      ctx,
      `😕 На цю дату немає вільних слотів (тривалість: ${durationMin} хв).${extraMsg}\n\nСпробуйте іншу дату.`,
      Markup.inlineKeyboard([
        [Markup.button.callback("📅 Інша дата", "BACK")],
        [Markup.button.callback("↩️ На початок", "START_OVER")],
      ])
    );
  }

  // Кнопки по 3 в ряд
  const keyboard = [];
  for (let i = 0; i < slots.length; i += 3) {
    keyboard.push(
      slots
        .slice(i, i + 3)
        .map((s) =>
          Markup.button.callback(s.label ?? s.start, `TIME_${s.start}`)
        )
    );
  }

  keyboard.push([Markup.button.callback("⬅️ Назад", "BACK")]);

  return safeEditOrReply(
    ctx,
    `⏰ Оберіть зручний час (тривалість: ${durationMin} хв):`,
    Markup.inlineKeyboard(keyboard)
  );
}
