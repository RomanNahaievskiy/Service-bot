import { STEPS } from "../../core/fsm/steps.js";
import { getSession } from "../../utils/helpers.js";
import { createBooking } from "../../core/domain/bookings.js";
import { formatDate } from "../../core/domain/dates.js";
import { Markup } from "telegraf";

export async function confirmHandler(ctx) {
  console.log("✅ confirmHandler"); //test

  const session = getSession(ctx.chat.id);
  // FSM guard
  if (session.step !== STEPS.CONFIRM) {
    return ctx.answerCbQuery();
  }

  const booking = createBooking({
    chatId: ctx.chat.id,
    service: session.data.service,
    vehicle: session.data.vehicle,
    vehicleNumber: session.data.vehicleNumber,
    date: session.data.date,
    time: session.data.time,
  });

  session.step = STEPS.DONE; // Завершення процесу

  await ctx.answerCbQuery(); // Підтвердження обробки колбеку для телеграма

  await ctx.editMessageText(
    // Показуємо підтвердження запису
    `🎉 Запис підтверджено!\n\n
Послуга: ${booking.service.title}
ТЗ: ${booking.vehicle.title}
Номер: ${booking.vehicleNumber}
Дата: ${formatDate(booking.date)}
Час: ${booking.time}

📍 Чекаємо на вас у зазначений час.`,
    Markup.inlineKeyboard([
      [Markup.button.callback("➕ Новий запис", "START_OVER")], // Кнопка для початку нового запису
    ])
  );
}
