import { STEPS } from "../../core/fsm/steps.js";
import { getSession } from "../../utils/helpers.js";
import { getVehicleByCallback } from "../../core/domain/vehicles.js";
import { Markup } from "telegraf";

export async function vehicleTypeHandler(ctx) {
  console.log("🚗 vehicleTypeHandler", ctx.callbackQuery.data); //  test

  const session = getSession(ctx.chat.id);
  const callbackData = ctx.callbackQuery.data;

  const vehicle = getVehicleByCallback(callbackData);

  if (!vehicle) {
    return ctx.answerCbQuery("Невідомий тип ТЗ");
  }

  session.step = STEPS.VEHICLE_DATA;
  session.data.vehicle = vehicle;

  await ctx.answerCbQuery(); //підтверджуємо отримання callback для телеграму

  await ctx.editMessageText(
    `🚘 Тип ТЗ: ${vehicle.title}\n\nВведіть дані транспортного засобу (номер):`,
    Markup.inlineKeyboard([
      // [Markup.button.callback("⬅️ Назад", "BACK_TO_VEHICLE")], // не спрацьовує, бо в роутері в цій точці спрацьовує bot.on("Text")
    ])
  );
}
