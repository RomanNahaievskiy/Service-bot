import { STEPS } from "../../core/fsm/steps.js";
import { getSession } from "../../utils/helpers.js";
import { goToStep } from "../../core/fsm/transition.js";
import { renderStep } from "../render/renderStep.js";
import { upsertClient } from "../../core/domain/clients.js";

export async function phoneHandler(ctx) {
  console.log("📱 phoneHandler"); // test debug

  const chatId =
    ctx.chat?.id ??
    ctx.callbackQuery?.message?.chat?.id ??
    ctx.update?.callback_query?.message?.chat?.id;

  const session = getSession(chatId);

  if (session.step !== STEPS.PHONE) return;

  const contact = ctx.message?.contact;

  if (!contact?.phone_number) {
    return ctx.reply(
      "❗ Не бачу номера. Натисніть кнопку «📱 Надіслати номер».",
    );
  }

  // 🔐 Захист: приймаємо тільки власний номер
  if (contact.user_id && contact.user_id !== ctx.from.id) {
    return ctx.reply("❗ Будь ласка, надішліть *свій* номер телефону.");
  }

  session.data.phone = `${contact.phone_number}`; // збереження як рядок
  session.data.fullName = `${contact.first_name || ""} ${
    contact.last_name || ""
  }`.trim();
  console.log("PHONE step: session.data.phone =", session.data.phone); // test debug
  // ✅ Зберігаємо/оновлюємо клієнта у Google Sheets (Clients)
  await upsertClient({
    tgUserId: String(ctx.from?.id || ""),
    chatId: String(chatId),
    phone: session.data.phone,
    fullName: session.data.fullName,
    username: ctx.from?.username || "",
  });

  await ctx.reply(
    "✅ Дякую! Номер збережено.",
    { reply_markup: { remove_keyboard: true } }, // ховаємо клавіатуру
  );

  goToStep(session, STEPS.CONFIRM);

  return renderStep(ctx, session);
}
