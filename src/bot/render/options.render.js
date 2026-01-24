import { Markup } from "telegraf";
import { safeEditOrReply } from "./safeEditOrReply.js";

export async function renderOptions(ctx, session) {
  const prices = session.data?.prices;
  const vehicleId = session.data?.vehicleId;
  const vehicleGroup = session.data?.vehicleGroup;

  if (!prices || !vehicleId) {
    return safeEditOrReply(
      ctx,
      "❌ Неможливо показати додаткові послуги. Дані відсутні.",
      Markup.inlineKeyboard([[Markup.button.callback("⬅️ Назад", "BACK")]]),
    );
  }

  const selected = session.data.options ?? []; // масив optionId

  const options = prices.options.filter((o) => {
    if (!o.active) return false;

    // applicableGroup
    if (o.applicableGroup !== "all" && o.applicableGroup !== vehicleGroup)
      return false;

    // applicableVehicleId
    if (o.applicableVehicleId !== "all" && o.applicableVehicleId !== vehicleId)
      return false;

    return true;
  });

  if (!options.length) {
    return safeEditOrReply(
      ctx,
      "ℹ️ Для цього транспорту немає додаткових послуг.",
      Markup.inlineKeyboard([
        [Markup.button.callback("⬅️ Назад", "BACK")],
        [Markup.button.callback("➡️ Продовжити", "OPT_DONE")],
      ]),
    );
  }

  const buttons = options.map((o) => {
    const isOn = selected.includes(o.optionId);
    const mark = isOn ? "✅" : "⬜️";

    return [
      Markup.button.callback(
        `${mark} ${o.optionTitle} (+${o.price} грн / ${o.durationMin} хв)`,
        `OPT_TOGGLE_${o.optionId}`,
      ),
    ];
  });

  const summary = calculateSummary(session);

  buttons.push([
    Markup.button.callback("⬅️ Назад", "BACK"),
    Markup.button.callback("➡️ Продовжити", "OPT_DONE"),
  ]);

  return safeEditOrReply(
    ctx,
    `➕ Додаткові послуги\n\n` +
      `💰 Поточна вартість: ${summary.totalPrice} грн\n` +
      `⏱ Тривалість: ${summary.totalDurationMin} хв`,
    Markup.inlineKeyboard(buttons),
  );
}

/* ================= helpers ================= */

function calculateSummary(session) {
  const prices = session.data.prices;
  const vehicleId = session.data.vehicleId;
  const selected = session.data.options ?? [];

  const vehicle = prices.vehicles.find((v) => v.vehicleId === vehicleId);

  let totalPrice = vehicle?.basePrice ?? 0;
  let totalDurationMin = vehicle?.baseDurationMin ?? 0;

  for (const optId of selected) {
    const opt = prices.options.find((o) => o.optionId === optId);
    if (!opt) continue;

    totalPrice += opt.price || 0;
    totalDurationMin += opt.durationMin || 0;
  }

  // кешуємо для confirm
  session.data.pricing = { totalPrice, totalDurationMin };

  return { totalPrice, totalDurationMin };
}
