import { STEPS } from "../../core/fsm/steps.js";
import { getSession } from "../../utils/helpers.js";
import { createBooking } from "../../core/domain/bookings.js";
import { formatDate } from "../../core/domain/dates.js";
import { Markup } from "telegraf";

export async function confirmHandler(ctx) {
  console.log("✅ confirmHandler");

  const session = getSession(ctx.chat.id);
  console.log("DEBUG time raw:", session.data.time); //test

  // FSM guard
  if (session.step !== STEPS.CONFIRM) {
    return ctx.answerCbQuery();
  }

  // ✅ 1) createBooking тепер async → await
  let booking;
  try {
    booking = await createBooking({
      chatId: ctx.chat.id,
      service: session.data.service,
      vehicle: session.data.vehicle,
      vehicleNumber: session.data.vehicleNumber,
      date: session.data.date,
      time: session.data.time,
      // якщо зберігаєш ПІБ/тел — додай тут
      fullName: session.data.fullName,
      phone: session.data.phone,
    });
  } catch (err) {
    console.error("❌ createBooking failed", err);

    await ctx.answerCbQuery("Помилка створення запису", { show_alert: true });

    // Не переводимо в DONE, даємо повторити
    return ctx.editMessageText(
      "❌ Не вдалося створити запис. Спробуйте ще раз або оберіть інший час.",
      Markup.inlineKeyboard([
        [Markup.button.callback("🔁 Обрати інший час", "BACK_TO_DATE")],
        [Markup.button.callback("➕ Новий запис", "START_OVER")],
      ])
    );
  }

  // ✅ 2) Переводимо в DONE тільки після успішного збереження
  session.step = STEPS.DONE;

  await ctx.answerCbQuery();

  // ✅ 3) Для відображення беремо дані з session (бо booking із Sheets має інші поля)
  const serviceTitle =
    typeof session.data.service === "string"
      ? session.data.service
      : session.data.service?.title || "—";

  const vehicleTitle =
    typeof session.data.vehicle === "string"
      ? session.data.vehicle
      : session.data.vehicle?.title || "—";

  await ctx.editMessageText(
    `🎉 Запис підтверджено!\n\n` +
      `Послуга: ${serviceTitle}\n` +
      `ТЗ: ${vehicleTitle}\n` +
      `Номер: ${session.data.vehicleNumber || "—"}\n` +
      `Дата: ${formatDate(session.data.date)}\n` +
      `Час: ${session.data.time}\n\n` +
      `🧾 ID запису: ${booking.id}\n\n` +
      `📍 Чекаємо на вас у зазначений час.`,
    Markup.inlineKeyboard([
      [Markup.button.callback("➕ Новий запис", "START_OVER")],
    ])
  );
}
