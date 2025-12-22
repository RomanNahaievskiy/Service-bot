import { STEPS } from "../../core/fsm/steps.js"; //кінцевий автомат (FSM), контролює сценарій
import { getSession } from "../../utils/helpers.js"; //отримуємо персональну сесію користувача (state + data)
import { getServiceByCallback } from "../../core/domain/services.js"; //для отримання послуг за даними callback
import { Markup } from "telegraf"; //для створення клавіатур та кнопок

export async function serviceHandler(ctx) {
  console.log("🔥 serviceHandler called", ctx.callbackQuery.data); // test

  const session = getSession(ctx.chat.id); //отримуємо сесію користувача
  const callbackData = ctx.callbackQuery.data; //отримуємо дані callback

  const service = getServiceByCallback(callbackData); //отримуємо послугу за даними callback

  if (!service) {
    //якщо послуга не знайдена , захист від помилок
    return ctx.answerCbQuery("Невідома послуга");
  }
  session.data ??= {}; //ініціалізуємо дані сесії, якщо вони не існують

  session.step = STEPS.VEHICLE_TYPE; //оновлюємо крок сесії на вибір типу ТЗ (переходимо до наступного кроку)
  session.data.service = service; //зберігаємо обрану послугу в сесії

  await ctx.answerCbQuery(); //підтверджуємо отримання callback для телеграму

  await ctx.editMessageText(
    //редагуємо повідомлення з новим текстом та клавіатурою
    `✅ Обрано послугу: ${service.title}\n\nОберіть тип ТЗ:`,
    Markup.inlineKeyboard([
      [Markup.button.callback(" 🚐 Автобус", "VEHICLE_BUS")],
      [Markup.button.callback("🚐 Бус", "VEHICLE_VAN")],
      [Markup.button.callback("🚛 Тягач", "VEHICLE_TRUCK")],
      [Markup.button.callback("⬅️ Назад", "BACK_TO_SERVICE")],
    ])
  );
}
