// import { Markup } from "telegraf";
// import { safeEditOrReply } from "./safeEditOrReply.js";

// export async function renderTime(ctx, session) {
//   const slots = Array.isArray(session.data.timeSlots)
//     ? session.data.timeSlots
//     : [];
//   const durationMin = Number(session.data?.pricing?.totalDurationMin || 30);

//   // Немає слотів
//   if (slots.length === 0) {
//     const extraMsg = session.data.timeSlotsError
//       ? `\n\n⚠️ ${session.data.timeSlotsError}`
//       : "";

//     return safeEditOrReply(
//       ctx,
//       `😕 На цю дату немає вільних слотів (тривалість: ${durationMin} хв).${extraMsg}\n\nСпробуйте іншу дату.`,
//       Markup.inlineKeyboard([
//         [Markup.button.callback("📅 Інша дата", "BACK")],
//         [Markup.button.callback("↩️ На початок", "START_OVER")],
//       ])
//     );
//   }

//   // Кнопки по 3 в ряд
//   const keyboard = [];
//   for (let i = 0; i < slots.length; i += 3) {
//     keyboard.push(
//       slots
//         .slice(i, i + 3)
//         .map((s) =>
//           Markup.button.callback(s.label ?? s.start, `TIME_${s.start}`)
//         )
//     );
//   }

//   keyboard.push([Markup.button.callback("⬅️ Назад", "BACK")]);

//   return safeEditOrReply(
//     ctx,
//     `⏰ Оберіть зручний час (тривалість: ${durationMin} хв):`,
//     Markup.inlineKeyboard(keyboard)
//   );
// }

import { Markup } from "telegraf";
import { safeEditOrReply } from "./safeEditOrReply.js";

const PAGE_SIZE = 12; // 12 слотів = 4 рядки по 3

export async function renderTime(ctx, session) {
  const slots = Array.isArray(session.data.timeSlots)
    ? session.data.timeSlots
    : [];

  const durationMin = Number(session.data?.pricing?.totalDurationMin || 30);

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

  // ✅ Пагінація
  const totalPages = Math.max(1, Math.ceil(slots.length / PAGE_SIZE));
  const currentPageRaw = Number(session.data.timePage ?? 0);
  const currentPage = Math.min(Math.max(currentPageRaw, 0), totalPages - 1);
  session.data.timePage = currentPage;

  const startIndex = currentPage * PAGE_SIZE;
  const pageSlots = slots.slice(startIndex, startIndex + PAGE_SIZE);

  // Кнопки по 3 в ряд (лише для поточної сторінки)
  const keyboard = [];
  for (let i = 0; i < pageSlots.length; i += 3) {
    keyboard.push(
      pageSlots
        .slice(i, i + 3)
        .map((s) =>
          Markup.button.callback(s.label ?? s.start, `TIME_${s.start}`)
        )
    );
  }

  // ✅ Навігація сторінок
  const navRow = [];
  if (currentPage > 0) navRow.push(Markup.button.callback("◀️", "TPPREV"));
  navRow.push(
    Markup.button.callback(`📄 ${currentPage + 1}/${totalPages}`, "TPINFO")
  );
  if (currentPage < totalPages - 1)
    navRow.push(Markup.button.callback("▶️", "TPNEXT"));
  keyboard.push(navRow);

  keyboard.push([Markup.button.callback("⬅️ Назад", "BACK")]);

  return safeEditOrReply(
    ctx,
    `⏰ Оберіть зручний час (тривалість: ${durationMin} хв)\nСторінка ${
      currentPage + 1
    }/${totalPages}:`,
    Markup.inlineKeyboard(keyboard)
  );
}
