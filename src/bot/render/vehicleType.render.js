import { Markup } from "telegraf";
import { safeEditOrReply } from "./safeEditOrReply.js";

export async function renderVehicleType(ctx, session) {
  const vehicles = session.data?.prices?.vehicles ?? [];
  const group = session.data?.vehicleGroup; // "passenger" | "cargo" | "tanker" | "other"

  if (!group) {
    return safeEditOrReply(
      ctx,
      "❌ Не вибрано групу транспорту. Натисніть «Назад» і оберіть тип.",
      Markup.inlineKeyboard([[Markup.button.callback("⬅️ Назад", "BACK")]]),
    );
  }

  // other -> не показуємо список, а відразу даємо інструкцію
  if (group === "other") {
    return safeEditOrReply(
      ctx,
      "❓ Інший транспорт\n\nБудь ласка, звʼяжіться з адміністратором для уточнення вартості та часу.",
      Markup.inlineKeyboard([
        [Markup.button.callback("⬅️ Назад", "BACK")],
        [Markup.button.callback("↩️ На початок", "START_OVER")],
      ]),
    );
  }

  const list = vehicles
    .filter((v) => v.active)
    .filter((v) => v.group === group);

  if (!list.length) {
    return safeEditOrReply(
      ctx,
      "❌ Для цього типу транспорту наразі немає доступних варіантів.",
      Markup.inlineKeyboard([[Markup.button.callback("⬅️ Назад", "BACK")]]),
    );
  }

  // Кнопки по 1 в ряд (можна зробити по 2, але назви довгі)
  const keyboard = list.map((v) => [
    Markup.button.callback(
      `${v.vehicleTitle} — ${v.basePrice} грн`,
      `VEH_${v.vehicleId}`,
    ),
  ]);

  keyboard.push([Markup.button.callback("⬅️ Назад", "BACK")]);

  return safeEditOrReply(
    ctx,
    `🚗 Оберіть транспорт (Ціни портальної мийки)  (${groupTitle(group)}):`,
    Markup.inlineKeyboard(keyboard),
  );
}

function groupTitle(group) {
  switch (group) {
    case "passenger":
      return "пасажирський";
    case "cargo":
      return "вантажний";
    case "tanker":
      return "цистерна";
    default:
      return group;
  }
}
