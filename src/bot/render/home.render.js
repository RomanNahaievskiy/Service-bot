import { Markup } from "telegraf";

export async function renderHome(ctx, session) {
  return ctx.reply(
    "Вітаю! Натисніть кнопку нижче, щоб створити новий запис на мийку 👇",
    Markup.keyboard([["🆕 Новий запис"]]).resize(),
  );
}
