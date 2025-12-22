import { STEPS } from "../../core/fsm/steps.js";
import { getSession } from "../../utils/helpers.js";
import { Markup } from "telegraf";

export async function backToDateHandler(ctx) {
  console.log("📅 backToDateHandler", ctx.callbackQuery.data); //test
  const session = getSession(ctx.chat.id);

  session.step = STEPS.DATE;
  delete session.data.time;

  await ctx.answerCbQuery();

  await ctx.editMessageText(
    "Оберіть дату запису:",
    Markup.inlineKeyboard([
      [Markup.button.callback("📅 Сьогодні", "DATE_TODAY")],
      [Markup.button.callback("📆 Завтра", "DATE_TOMORROW")],
      [Markup.button.callback("⬅️ Назад", "BACK_TO_VEHICLE_DATA")],
    ])
  );
}
