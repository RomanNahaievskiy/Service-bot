import { Markup } from "telegraf";

export async function renderVehicleGroup(ctx, session) {
  return ctx.editMessageText(
    `🚗 Оберіть тип транспорту:`,
    Markup.inlineKeyboard([
      [Markup.button.callback("🚌 Пасажирський", "GROUP_PASSENGER")],
      [Markup.button.callback("🚛 Вантажний", "GROUP_CARGO")],
      [Markup.button.callback("🚚 Цистерна", "GROUP_TANKER")],
      [Markup.button.callback("❓ Інший", "GROUP_OTHER")],
      [Markup.button.callback("⬅️ Назад", "BACK")],
    ])
  );
}
