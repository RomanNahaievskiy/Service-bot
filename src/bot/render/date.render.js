import { Markup } from "telegraf";
import { safeEditOrReply } from "./safeEditOrReply.js";
import { formatDate } from "../../core/domain/dates.js";

export async function renderDate(ctx, session) {
  const price = session.data?.pricing?.totalPrice;
  const duration = session.data?.pricing?.totalDurationMin;

  const extra =
    price || duration
      ? `\n💰 Вартість: ${price ?? "—"} грн\n⏱ Тривалість: ${
          duration ?? "—"
        } хв\n`
      : "";

  const selectedDate = session.data?.date
    ? formatDate(session.data.date)
    : null;

  return safeEditOrReply(
    ctx,
    `📅 Оберіть дату запису:` +
      (selectedDate ? `\n\nПоточний вибір: ${selectedDate}` : "") +
      extra,
    Markup.inlineKeyboard([
      [Markup.button.callback("📅 Сьогодні", "DATE_TODAY")],
      [Markup.button.callback("📆 Завтра", "DATE_TOMORROW")],
      // якщо захочеш календар — додамо пізніше
      // [Markup.button.callback("🗓 Інша дата", "DATE_PICK")],
      [Markup.button.callback("⬅️ Назад", "BACK")],
      [Markup.button.callback("↩️ На початок", "START_OVER")],
    ])
  );
}
