import { Markup } from "telegraf";
import { STEPS } from "../../core/fsm/steps.js";
import { getSession } from "../../utils/helpers.js";
import { goToStep } from "../../core/fsm/transition.js";
import { renderStep } from "../render/renderStep.js";

function normalizePhone(text) {
  const s = String(text || "").trim();
  const cleaned = s.replace(/[^\d+]/g, "");
  const digits = cleaned.replace(/\D/g, "");

  if (digits.length < 9) return null;

  if (cleaned.startsWith("+")) return cleaned;
  if (digits.startsWith("380")) return `+${digits}`;
  if (digits.startsWith("0") && digits.length === 10) return `+38${digits}`;

  return cleaned;
}

export async function phoneTextHandler(ctx) {
  console.log("📱 phoneTextHandler"); // test debug
  const chatId =
    ctx.chat?.id ??
    ctx.callbackQuery?.message?.chat?.id ??
    ctx.update?.callback_query?.message?.chat?.id;
  const session = getSession(chatId);

  if (session.step !== STEPS.PHONE) return;

  const phone = normalizePhone(ctx.message?.text);
  if (!phone) {
    return ctx.reply(
      "📱 Введіть номер у форматі +380XXXXXXXXX або натисніть кнопку «📱 Надіслати номер».",
      Markup.keyboard([Markup.button.contactRequest("📱 Надіслати номер")])
        .resize()
        .oneTime()
    );
  }

  session.data.phone = phone;
  session.data.fullName = `${
    contact.first_name || ctx.from?.first_name || ""
  } ${contact.last_name || ctx.from?.last_name || ""}`.trim();

  console.log("PHONE step: session.data.phone =", session.data.phone); // test debug
  // ✅ Зберігаємо/оновлюємо клієнта у Google Sheets (Clients)
  await upsertClient({
    tgUserId: String(ctx.from?.id || ""),
    chatId: String(chatId),
    phone: session.data.phone,
    fullName: session.data.fullName,
    username: ctx.from?.username || "",
  });

  console.log("PHONE step: session.data.phone =", session.data.phone); // test debug
  // прибираємо reply keyboard (контакт)
  await ctx.reply("✅ Номер прийнято.", Markup.removeKeyboard());

  goToStep(session, STEPS.CONFIRM);
  return renderStep(ctx, session);
}
