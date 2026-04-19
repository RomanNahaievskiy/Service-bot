import { Markup } from "telegraf";
import { safeEditOrReply } from "../../bot/render/safeEditOrReply.js";

export function renderContractVehicle(ctx, session) {
  console.log("Rendering CONTRACT_VEHICLE step");

  const err = session.data.contractVehicleError;
  // const contractNo = session.data.contractNo;

  const text = err
    ? `❌ ${err}\n\nВведіть Р/Н транспортного засобу ще раз 👇`
    : `\nВведіть Р/Н транспортного засобу 👇`;

  return safeEditOrReply(
    ctx,
    text,
    Markup.inlineKeyboard([
      [Markup.button.callback("⬅️ Назад", "BACK")],
      [Markup.button.callback("↩️ На початок", "START_OVER")],
    ]),
  );
}
