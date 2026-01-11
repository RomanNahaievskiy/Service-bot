import { Markup } from "telegraf";
import { safeEditOrReply } from "./safeEditOrReply.js";

export async function renderPhone(ctx, session) {
  // Якщо номер вже є в сесії — не змушуємо знову ділитись контактом
  if (session?.data?.phone) {
    return safeEditOrReply(
      ctx,
      `📱 У нас вже є ваш номер: ${session.data.phone}\n\nВикористати його для підтвердження запису?`,
      Markup.inlineKeyboard([
        [Markup.button.callback("✅ Використати", "USE_SAVED_PHONE")],
        [Markup.button.callback("✏️ Змінити номер", "CHANGE_PHONE")],
        [Markup.button.callback("⬅️ Назад", "BACK")],
      ])
    );
  }

  return safeEditOrReply(
    ctx,
    "📱 Будь ласка, надішліть номер телефону для зворотного звʼязку.\n\nНатисніть кнопку нижче 👇",
    Markup.keyboard([Markup.button.contactRequest("📱 Надіслати номер")])
      .oneTime()
      .resize()
  );
}
