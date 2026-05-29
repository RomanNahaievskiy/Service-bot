import { Markup } from "telegraf";
import { formatDate } from "../../core/domain/dates.js";
import { safeEditOrReply } from "./safeEditOrReply.js";

export async function renderConfirm(ctx, session) {
  const err = session.data.confirmError;
  const serviceTitle =
    typeof session.data.serviceTitle === "string"
      ? session.data.serviceTitle
      : session.data.serviceTitle || "-";

  const vehicleTitle =
    session.data?.vehicleTitle ||
    session.data?.prices?.vehicles?.find(
      (v) => v.vehicleId === session.data?.vehicleId,
    )?.vehicleTitle ||
    "-";

  const priceBlock = buildPriceBlock(session);
  const optionsBlock =
    session.data.optionTitles && session.data.optionTitles.length
      ? `Додаткові послуги:\n + ${session.data.optionTitles.join("\n + ")}\n`
      : "";

  const errBlock = err
    ? `\nПомилка: ${err}\nЦей час вже хтось бронює. Оберіть інший час.`
    : "";

  return safeEditOrReply(
    ctx,
    `Перевірте дані запису:\n\n` +
      `Послуга: ${serviceTitle}\n` +
      optionsBlock +
      `Т/З: ${vehicleTitle}\n` +
      `Р/Н: ${session.data.vehicleNumber || "-"}\n` +
      `Дата: ${formatDate(session.data.date)}\n` +
      `Час: ${session.data.time}\n` +
      priceBlock +
      errBlock,
    Markup.inlineKeyboard([
      [Markup.button.callback("Підтвердити", "CONFIRM")],
      [Markup.button.callback("Назад", "BACK")],
      [Markup.button.callback("На початок", "START_OVER")],
    ]),
  );
}

function buildPriceBlock(session) {
  const pricing = session.data?.pricing || {};
  const price = pricing.totalPrice;
  const duration = pricing.totalDurationMin;

  if (!price && !duration) return "";

  if (session.data.clientType === "contract") {
    return (
      `\nВартість: згідно умов договору\n` +
      `Тривалість: ${duration ?? "-"} хв\n`
    );
  }

  if (Number(pricing.discountAmount || 0) > 0) {
    const promoCode =
      pricing?.promo?.code ||
      session.data?.promo?.code ||
      session.data?.promo?.enteredCode;
    const promoLine = promoCode ? `Промокод: ${promoCode}\n` : "";

    return (
      `\nВартість: ${pricing.originalTotalPrice ?? price} грн\n` +
      promoLine +
      `Знижка: -${pricing.discountAmount} грн\n` +
      `До сплати: ${price ?? "-"} грн\n` +
      `Тривалість: ${duration ?? "-"} хв\n`
    );
  }

  return (
    `\nВартість: ${price ?? "-"} грн\n` +
    `Тривалість: ${duration ?? "-"} хв\n`
  );
}
