import { STEPS } from "../../core/fsm/steps.js";
import { getSession } from "../../utils/helpers.js";
import { Markup } from "telegraf";

export async function backToVehicleDataHandler(ctx) {
  console.log("🚗 backToVehicleDataHandler", ctx.callbackQuery.data); //test
  const session = getSession(ctx.chat.id);

  session.step = STEPS.VEHICLE_DATA; // Повертаємося до введення даних ТЗ
  delete session.data.vehicle; // Видаляємо вибране ТЗ
  delete session.data.vehicleNumber; // Видаляємо номер ТЗ

  await ctx.answerCbQuery(); // Підтвердження обробки колбеку для телеграма

  await ctx.editMessageText(
    "Введіть номер транспортного засобу:",
    Markup.inlineKeyboard([
      [Markup.button.callback("⬅️ Назад", "BACK_TO_VEHICLE_TYPE")],
    ])
  );
}
