import { getSession } from "../../utils/helpers.js";
import { renderStep } from "../render/renderStep.js";

// Наступна сторінка часу (timePage + 1)
export async function timePageNextHandler(ctx) {
  console.log("✅ timePageNextHandler");
  const chatId =
    ctx.chat?.id ??
    ctx.callbackQuery?.message?.chat?.id ??
    ctx.update?.callback_query?.message?.chat?.chat?.id;

  const session = getSession(chatId);

  session.data.timePage = Number(session.data.timePage ?? 0) + 1;

  if (ctx.callbackQuery) await ctx.answerCbQuery();
  return renderStep(ctx, session);
}
