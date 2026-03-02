import { Markup } from "telegraf";
import { safeEditOrReply } from "./safeEditOrReply.js";

/**
 * Рендер вибору групи транспорту
 * Очікує:
 * session.data.prices.vehicles (масив з prices_get)
 */
export async function renderVehicleGroup(ctx, session) {
  const vehicles = session.data?.prices?.vehicles ?? [];

  if (!vehicles.length) {
    return safeEditOrReply(
      ctx,
      "❌ Наразі типи транспорту недоступні. Спробуйте пізніше.",
    );
  }

  // Витягуємо унікальні групи
  const groupsMap = new Map();

  for (const v of vehicles) {
    if (!v.active) continue;

    if (!groupsMap.has(v.group)) {
      groupsMap.set(v.group, {
        group: v.group,
        title: groupTitle(v.group),
      });
    }
  }

  const buttons = Array.from(groupsMap.values()).map((g) => [
    Markup.button.callback(g.title, `GROUP_${g.group.toUpperCase()}`),
  ]);

  buttons.push([Markup.button.callback("⬅️ Назад", "BACK")]);

  return safeEditOrReply(
    ctx,
    "🚗 Оберіть вид транспорту:",
    Markup.inlineKeyboard(buttons),
  );
}

/**
 * Мапа назв груп (UI)
 * ⚠️ це UI-рівень, НЕ бізнес-логіка
 */
function groupTitle(group) {
  switch (group) {
    case "passenger":
      return "🚐 Пасажирський транспорт";
    case "cargo":
      return "🚛 Вантажний транспорт";
    case "tanker":
      return "🛢️ Автоцистерна";
    case "other":
      return "❓ Інший транспорт";
    default:
      return group;
  }
}
