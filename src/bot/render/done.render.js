import { Markup } from "telegraf";
import { safeEditOrReply } from "./safeEditOrReply.js";
import { formatDate } from "../../core/domain/dates.js";

export async function renderDone(ctx, session) {
  const serviceTitle =
    typeof session.data.serviceTitle === "string"
      ? session.data.serviceTitle
      : session.data.serviceTitle || "—";
  const optionTitles = session.data.optionTitles || [];

  // якщо ти вже перейшов на prices_get:
  // const vehicleTitle =
  // session.data?.prices?.vehicles?.find(
  //   (v) => v.vehicleId === session.data?.vehicleId,
  // )?.vehicleTitle ||
  // (typeof session.data.vehicle === "string"
  //   ? session.data.vehicle
  //   : session.data.vehicle?.title || "—");
  const vehicleTitle =
    session.data?.vehicleTitle || // якщо вже є в сесії (може бути встановлено раніше, якщо prices_get не виконувався через контракт), то використовуємо його
    session.data?.prices?.vehicles?.find(
      (v) => v.vehicleId === session.data?.vehicleId,
    )?.vehicleTitle;
  const price = session.data?.pricing?.totalPrice;
  const duration = session.data?.pricing?.totalDurationMin;

  const bookingId = session.data?.booking?.id || session.data?.bookingId || "—";

  const phone = session.data?.phone ? String(session.data.phone) : null;
  const fullName = session.data?.fullName
    ? String(session.data.fullName)
    : null;

  const isContract = session.data.clientType === "contract";
  let extra = "";
  if (isContract) {
    extra = `\n💰 Вартість: Згідно умов договору\n⏱ Тривалість: ${duration ?? "—"} хв`;
  } else {
    extra =
      price || duration
        ? `\n💰 Вартість: ${price ?? "—"} грн\n⏱ Тривалість: ${
            duration ?? "—"
          } хв`
        : "";
  }

  const contact =
    fullName || phone
      ? `\n\n👤 Контакт: ${fullName ?? "—"}\n📞 Телефон: ${phone ?? "—"}`
      : "";

  // Прибираємо reply-клавіатуру (після контакту), але inline залишаємо
  // return safeEditOrReply(
  //   ctx,
  //   `🎉 Запис створено!\n\n` +
  //     `Послуга: ${serviceTitle}\n` +
  //     `Транспорт: ${vehicleTitle}\n` +
  //     `Номер/опис: ${session.data.vehicleNumber || "—"}\n` +
  //     `Дата: ${formatDate(session.data.date)}\n` +
  //     `Час: ${session.data.time}\n` +
  //     extra +
  //     contact +
  //     `\n\n🧾 ID: ${bookingId}\n\n` +
  //     `📍 Чекаємо на вас у зазначений час.`,
  //   {
  //     reply_markup: {
  //       ...Markup.inlineKeyboard([
  //         [Markup.button.callback("➕ Новий запис", "START_OVER")],
  //       ]).reply_markup,
  //       remove_keyboard: true, // ✅ прибирає кнопки "поділитися контактом"
  //     },
  //   }
  // );

  //========================================================================================================================================================
  // Новий варіант без safeEditOrReply — просто нове повідомлення
  const text =
    `🎉 Запис створено!\n\n` +
    `Послуга: ${serviceTitle}\n` +
    `Додаткові послуги: ${optionTitles.length ? optionTitles.join(", ") : "—"}\n` +
    `Транспорт: ${vehicleTitle}\n` +
    `Реєстраційний номер: ${session.data.vehicleNumber || "—"}\n` +
    `Дата: ${formatDate(session.data.date)}\n` +
    `Час: ${session.data.time}\n` +
    extra +
    contact +
    `\n\n🧾 ID: ${bookingId}\n\n` +
    `📍 Чекаємо на вас у зазначений час.`;

  // return ctx.reply(text, {
  //   reply_markup: {
  //     ...Markup.inlineKeyboard([
  //       [Markup.button.callback("➕ Новий запис", "START_OVER")],
  //     ]).reply_markup,
  //     remove_keyboard: true,
  //   },
  // });

  await ctx.reply(
    text,
    // Markup.inlineKeyboard([
    //   [Markup.button.callback("➕ Новий запис", "START_OVER")],
    // ])
    Markup.keyboard([["Записатися на мийку"]]).resize(),
  );

  // прибрати стару reply-клавіатуру (контакт)
  await ctx.reply("📍 Локація нашого сервісу:");
  await ctx.replyWithLocation(49.41802286698074, 27.06679415590703);

  await ctx.reply("Або відкрийте маршрут у Google Maps:", {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: "Прокласти маршрут",
            url: "https://maps.google.com/?q=49.41802286698074,27.06679415590703",
          },
        ],
      ],
    },
  });
  // return ctx.reply("... додамо тут геолокацію ");
}
