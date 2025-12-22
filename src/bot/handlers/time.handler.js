import { STEPS } from "../../core/fsm/steps.js";
import { getSession } from "../../utils/helpers.js";
import { generateTimeSlots } from "../../core/domain/slots.js";
import { Markup } from "telegraf";

export async function timeHandler(ctx) {
  // Новий обробник для вибору часу
  console.log("⏰ timeHandler", ctx.callbackQuery.data); //test

  const session = getSession(ctx.chat.id);

  if (session.step !== STEPS.TIME) {
    return ctx.answerCbQuery();
  }

  const slots = generateTimeSlots(session.data.date); // Генеруємо слоти для вибраної дати

  const keyboard = [];
  for (let i = 0; i < slots.length; i += 3) {
    // по 3 кнопки в ряд
    keyboard.push(
      slots
        .slice(i, i + 3)
        .map((slot) => Markup.button.callback(slot.label, `TIME_${slot.value}`))
    );
  }

  keyboard.push([Markup.button.callback("⬅️ Назад", "BACK_TO_DATE")]);

  await ctx.answerCbQuery(); // Підтвердження обробки колбеку для телеграма

  await ctx.editMessageText(
    "⏰ Оберіть зручний час:",
    Markup.inlineKeyboard(keyboard)
  );
}
