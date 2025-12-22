import { STEPS } from "../../core/fsm/steps.js";
import { getSession } from "../../utils/helpers.js";
import { Markup } from "telegraf";

export async function vehicleDataHandler(ctx) {
  const session = getSession(ctx.chat.id);

  // ❗ Приймаємо текст ТІЛЬКИ якщо FSM у правильному стані (щоб захистити сценарій)
  if (session.step !== STEPS.VEHICLE_DATA) {
    return;
  }

  const vehicleNumber = ctx.message.text.trim();

  // Мінімальна валідація
  if (vehicleNumber.length < 3) {
    return ctx.reply("❌ Некоректний номер. Спробуйте ще раз:"); // повідомляємо користувача про помилку новим повідомленням (не замінюємо контекст)
  }

  session.data.vehicleNumber = vehicleNumber;
  session.step = STEPS.DATE; // переходимо до кроку вибору дати

  await ctx.reply(
    `✅ Номер ТЗ збережено: ${vehicleNumber}\n\nОберіть дату запису:`,
    Markup.inlineKeyboard([
      [Markup.button.callback("📅 Сьогодні", "DATE_TODAY")],
      [Markup.button.callback("📆 Завтра", "DATE_TOMORROW")],
      [Markup.button.callback("⬅️ Назад", "BACK_TO_VEHICLE_TYPE")],
    ])
  );
}
