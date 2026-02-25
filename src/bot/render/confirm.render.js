import { Markup } from "telegraf";
import { safeEditOrReply } from "./safeEditOrReply.js";
import { formatDate } from "../../core/domain/dates.js";

export async function renderConfirm(ctx, session) {
  const err = session.data.confirmError;
  console.log(session.data.serviceTitle);
  const serviceTitle =
    typeof session.data.serviceTitle === "string"
      ? session.data.serviceTitle
      : session.data.serviceTitle || "—";

  // const vehicleTitle =
  //   session.data?.prices?.vehicles?.find(
  //     (v) => v.vehicleId === session.data?.vehicleId,
  //   )?.vehicleTitle ||
  //   (typeof session.data.vehicle === "string"
  //     ? session.data.vehicle
  //     : session.data.vehicle?.title || "—");

  const vehicleTitle =
    session.data?.vehicleTitle || // якщо вже є в сесії (може бути встановлено раніше, якщо prices_get не виконувався через контракт), то використовуємо його
    session.data?.prices?.vehicles?.find(
      (v) => v.vehicleId === session.data?.vehicleId,
    )?.vehicleTitle;

  const price = session.data?.pricing?.totalPrice;
  const duration = session.data?.pricing?.totalDurationMin;

  const extra =
    price || duration
      ? `\nВартість: ${price ?? "—"} грн\nТривалість: ${duration ?? "—"} хв\n`
      : "";

  const errBlock = err
    ? `\n\n❌ Помилка: ${err}\nСпробуйте ще раз або поверніться назад.`
    : "";

  return safeEditOrReply(
    ctx,
    `✅ Перевірте дані запису:\n\n` +
      `Послуга: ${serviceTitle}\n` +
      //показуємо додаткові послуги
      `${session.data.optionTitles ? `Додаткові послуги: ${session.data.optionTitles}\n` : ""}` +
      `ТЗ: ${vehicleTitle}\n` +
      `Реєстраційний номер: ${session.data.vehicleNumber || "—"}\n` +
      `Дата: ${formatDate(session.data.date)}\n` +
      `Час: ${session.data.time}\n` +
      extra +
      errBlock,
    Markup.inlineKeyboard([
      [Markup.button.callback("✅ Підтвердити", "CONFIRM")],
      [Markup.button.callback("⬅️ Назад", "BACK")],
      [Markup.button.callback("↩️ На початок", "START_OVER")],
    ]),
  );
}
