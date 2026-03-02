// import { STEPS } from "../../core/fsm/steps.js";
import { Markup } from "telegraf";
import { safeEditOrReply } from "../../bot/render/safeEditOrReply.js";

export function renderContractNo(ctx, session) {
  console.log("Rendering CONTRACT_NO step");

  // return ctx.reply("Будь ласка, введіть номер вашого договору:", {
  //   reply_markup: {
  //     remove_keyboard: true,
  //   }
  // });
  const err = session.data.contractNoError;

  return safeEditOrReply(
    ctx,
    err ? `❌ ${err}` : "Будь ласка, введіть номер вашого договору 👇",
    Markup.inlineKeyboard([
      [Markup.button.callback("⬅️ Назад", "BACK")],
      [Markup.button.callback("↩️ На початок", "START_OVER")],
    ]),
  );
}
