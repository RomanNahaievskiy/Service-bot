import { STEPS } from "../../core/fsm/steps.js";

export function renderContractNo(ctx, session) {
  console.log("Rendering CONTRACT_NO step");

  return ctx.reply("Будь ласка, введіть номер вашого договору:", {
    reply_markup: {
      remove_keyboard: true,
    },
  });
}
