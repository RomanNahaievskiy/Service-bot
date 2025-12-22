import { STEPS } from "../../core/fsm/steps.js";
import { getSession } from "../../utils/helpers.js";
import { Markup } from "telegraf";

export async function backToVehicleTypeHandler(ctx) {
  console.log("🚗 backToVehicleTypeHandler", ctx.callbackQuery.data); //test
  const session = getSession(ctx.chat.id);

  session.step = STEPS.VEHICLE_TYPE; // Повертаємося до вибору типу ТЗ
  delete session.data.vehicle; // Видаляємо вибране ТЗ
  delete session.data.vehicleNumber; // Видаляємо номер ТЗ

  await ctx.answerCbQuery(); // Підтвердження обробки колбеку для телеграма

  await ctx.editMessageText(
    "Оберіть тип транспортного засобу:",
    Markup.inlineKeyboard([
      [Markup.button.callback("🚗 Автобус", "VEHICLE_BUS")],
      [Markup.button.callback("🚐 Бус", "VEHICLE_VAN")],
      [Markup.button.callback("🚛 Тягач", "VEHICLE_TRUCK")],
      [Markup.button.callback("⬅️ Назад", "BACK_TO_SERVICE")],
    ])
  );
}
