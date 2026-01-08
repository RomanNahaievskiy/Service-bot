import { Markup } from "telegraf";
import { STEPS } from "../../core/fsm/steps.js";
import { getSession } from "../../utils/helpers.js";

export async function askPhoneHandler(ctx) {
  console.log(" askPhoneHandler", ctx.callbackQuery.data); //test
  const session = getSession(ctx.chat.id);

  if (session.step !== STEPS.PHONE) return;

  await ctx.reply(
    "📞 Щоб ми могли підтвердити запис, поділіться, будь ласка, номером телефону:",
    Markup.keyboard([Markup.button.contactRequest("📱 Надіслати номер")])
      .oneTime()
      .resize()
  );
}
