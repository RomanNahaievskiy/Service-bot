import { Markup } from "telegraf";
import { safeEditOrReply } from "./safeEditOrReply.js";

export async function renderPhone(ctx, session) {
  return safeEditOrReply(
    ctx,
    "📱 Будь ласка, надішліть номер телефону для зворотного звʼязку.\n\nНатисніть кнопку нижче 👇",
    Markup.keyboard([Markup.button.contactRequest("📱 Надіслати номер")])
      .oneTime()
      .resize()
  );
}
