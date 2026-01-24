import { Markup } from "telegraf";
import { STEPS } from "../../core/fsm/steps.js";
import { getSession, resetSession } from "../../utils/helpers.js";
import { setStep } from "../../core/fsm/transition.js";
import { SERVICES } from "../../core/domain/services.js";

export async function startOverHandler(ctx) {
  console.log("🔄 startOverHandler");

  const chatId =
    ctx.chat?.id ??
    ctx.callbackQuery?.message?.chat?.id ??
    ctx.update?.callback_query?.message?.chat?.id;

  resetSession(chatId); //???

  const session = getSession(chatId);
  setStep(session, STEPS.SERVICE);

  session.data.fullName ??=
    ctx.from.first_name + (ctx.from.last_name ? " " + ctx.from.last_name : "");

  if (ctx.callbackQuery) await ctx.answerCbQuery();

  // ✅ Створюємо НОВЕ повідомлення для нового запису (DONE не чіпаємо)
  const services = Object.values(SERVICES);
  const buttons = services.map((s) => [
    Markup.button.callback(s.title, `SERVICE_${s.id.toUpperCase()}`),
  ]);

  // якщо хочеш кнопку назад/на початок — додай
  // buttons.push([Markup.button.callback("↩️ На початок", "START_OVER")]);

  await ctx.reply("Ок! Починаємо 🆕", Markup.removeKeyboard()); // пробую видалити кнопку

  return ctx.reply(
    "🆕 Новий запис. Оберіть послугу:",
    Markup.inlineKeyboard(buttons),
  );
}
