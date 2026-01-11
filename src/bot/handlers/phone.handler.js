import { STEPS } from "../../core/fsm/steps.js";
import { getSession } from "../../utils/helpers.js";
// import { Markup } from "telegraf";
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
      "❗ Не бачу номера. Натисніть кнопку «📱 Надіслати номер»."
    );
  }

  // 🔐 Захист: приймаємо тільки власний номер
  if (contact.user_id && contact.user_id !== ctx.from.id) {
    return ctx.reply("❗ Будь ласка, надішліть *свій* номер телефону.");
  }

  session.data.phone = contact.phone_number;
  session.data.fullName = `${contact.first_name || ""} ${
    contact.last_name || ""
  }`.trim();

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
    { reply_markup: { remove_keyboard: true } } // ховаємо клавіатуру
  );

  // session.step = STEPS.CONFIRM;
  goToStep(session, STEPS.CONFIRM);

  return renderStep(ctx, session);
  /* 

 

  // тут можна одразу викликати confirmHandler або показати summary
  await ctx.reply(
    // Показуємо підсумок запису
    `✅ Запис:\n  
Послуга: ${session.data.service.title}
ТЗ: ${session.data.vehicle.title}
Номер: ${session.data.vehicleNumber}
Дата: ${session.data.date.toLocaleDateString("uk-UA")}
Час: ${session.data.time}`,
    Markup.inlineKeyboard([
      [Markup.button.callback("✅ Підтвердити", "CONFIRM")], // Кнопка підтвердження
      [Markup.button.callback("⬅️ Назад", "BACK_TO_TIME")],
    ])
  );*/
}
