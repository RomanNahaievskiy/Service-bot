import { Markup } from "telegraf";
import { BUSINESS_CONFIG } from "../../config/business.config.js";
import {
  addDaysYMD,
  parseYMD,
  todayYMD,
} from "../../utils/timezone.js";
import { safeEditOrReply } from "./safeEditOrReply.js";

function dowShortUk(ymd) {
  const { year, month, day } = parseYMD(ymd);
  const d = new Date(Date.UTC(year, month - 1, day, 12, 0, 0, 0));
  return ["Нд", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"][d.getUTCDay()];
}

function ddmm(ymd) {
  const { month, day } = parseYMD(ymd);
  return `${String(day).padStart(2, "0")}.${String(month).padStart(2, "0")}`;
}

export async function renderDate(ctx, session) {
  const today = todayYMD(BUSINESS_CONFIG.TIME_ZONE);
  const days = Array.from({ length: 7 }, (_, i) => addDaysYMD(today, i));

  const keyboard = [];
  for (let i = 0; i < days.length; i += 3) {
    keyboard.push(
      days.slice(i, i + 3).map((day) =>
        Markup.button.callback(
          `${dowShortUk(day)} ${ddmm(day)}`,
          `DATE_${day}`,
        ),
      ),
    );
  }

  keyboard.push([Markup.button.callback("⬅️ Назад", "BACK")]);
  keyboard.push([Markup.button.callback("↩️ На початок", "START_OVER")]);

  return safeEditOrReply(
    ctx,
    "📅 Оберіть дату запису (7 днів вперед):",
    Markup.inlineKeyboard(keyboard),
  );
}
