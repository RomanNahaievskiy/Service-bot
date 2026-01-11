// import { Markup } from "telegraf";
// import { safeEditOrReply } from "./safeEditOrReply.js";
// import { formatDate } from "../../core/domain/dates.js";

// export async function renderDate(ctx, session) {
//   const price = session.data?.pricing?.totalPrice;
//   const duration = session.data?.pricing?.totalDurationMin;

//   const extra =
//     price || duration
//       ? `\n💰 Вартість: ${price ?? "—"} грн\n⏱ Тривалість: ${
//           duration ?? "—"
//         } хв\n`
//       : "";

//   const selectedDate = session.data?.date
//     ? formatDate(session.data.date)
//     : null;

//   return safeEditOrReply(
//     ctx,
//     `📅 Оберіть дату запису:` +
//       (selectedDate ? `\n\nПоточний вибір: ${selectedDate}` : "") +
//       extra,
//     Markup.inlineKeyboard([
//       [Markup.button.callback("📅 Сьогодні", "DATE_TODAY")],
//       [Markup.button.callback("📆 Завтра", "DATE_TOMORROW")],
//       // якщо захочеш календар — додамо пізніше
//       // [Markup.button.callback("🗓 Інша дата", "DATE_PICK")],
//       [Markup.button.callback("⬅️ Назад", "BACK")],
//       [Markup.button.callback("↩️ На початок", "START_OVER")],
//     ])
//   );
// }

import { Markup } from "telegraf";
import { safeEditOrReply } from "./safeEditOrReply.js";

function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function ymd(d) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

// Пн, Вт, ... Сб, Нд українською
function dowShortUk(d) {
  return ["Нд", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"][d.getDay()]; // 0=Нд ... 6=Сб
}

function ddmm(d) {
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${dd}.${mm}`;
}

// Рендер вибору дати: сьогодні + 6 днів
export async function renderDate(ctx, session) {
  const today = startOfDay(new Date());

  // 7 днів: сьогодні + 6
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    return d;
  });

  // кнопки по 3 в ряд
  const keyboard = [];
  for (let i = 0; i < days.length; i += 3) {
    keyboard.push(
      days
        .slice(i, i + 3)
        .map((d) =>
          Markup.button.callback(
            `${dowShortUk(d)} ${ddmm(d)}`,
            `DATE_${ymd(d)}`
          )
        )
    );
  }

  keyboard.push([Markup.button.callback("⬅️ Назад", "BACK")]);
  keyboard.push([Markup.button.callback("↩️ На початок", "START_OVER")]);

  return safeEditOrReply(
    ctx,
    "📅 Оберіть дату запису (7 днів вперед):",
    Markup.inlineKeyboard(keyboard)
  );
}
