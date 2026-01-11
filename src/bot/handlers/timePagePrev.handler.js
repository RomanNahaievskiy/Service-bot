import { getSession } from "../../utils/helpers.js";
import { renderStep } from "../render/renderStep.js";
// Попередня сторінка часу (timePage - 1)

export async function timePagePrevHandler(ctx) {
  console.log("✅ timePagePrevHandler");
  const chatId =
    ctx.chat?.id ??
    ctx.callbackQuery?.message?.chat?.id ??
    ctx.update?.callback_query?.message?.chat?.id;

  const session = getSession(chatId);

  session.data.timePage = Math.max(0, Number(session.data.timePage ?? 0) - 1);

  if (ctx.callbackQuery) await ctx.answerCbQuery();
  return renderStep(ctx, session);
}
