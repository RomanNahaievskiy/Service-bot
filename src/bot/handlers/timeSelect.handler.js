import { STEPS } from "../../core/fsm/steps.js";
import { getSession } from "../../utils/helpers.js";
import { Markup } from "telegraf";

export async function timeSelectHandler(ctx) {
  // Новий обробник для підтвердження вибору часу
  console.log("⏰ timeSelectHandler", ctx.callbackQuery.data); //test

  const session = getSession(ctx.chat.id);
  const time = ctx.callbackQuery.data.replace("TIME_", "");

  if (session.step !== STEPS.TIME) {
    return ctx.answerCbQuery();
  }

  session.data.time = time;
  session.step = STEPS.CONFIRM; // Переходимо до підтвердження запису

  await ctx.answerCbQuery(); // Підтвердження обробки колбеку для телеграма

  await ctx.editMessageText(
    // Показуємо підсумок запису
    `✅ Запис:\n
Послуга: ${session.data.service.title}
ТЗ: ${session.data.vehicle.title}
Номер: ${session.data.vehicleNumber}
Дата: ${session.data.date.toLocaleDateString("uk-UA")}
Час: ${time}`,
    Markup.inlineKeyboard([
      [Markup.button.callback("✅ Підтвердити", "CONFIRM")], // Кнопка підтвердження
      [Markup.button.callback("⬅️ Назад", "BACK_TO_TIME")],
    ])
  );
}
