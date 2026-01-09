import { renderStep } from "../render/renderStep.js";

export async function backHandler(ctx) {
  console.log("⬅️ BACK pressed");

  const session = ctx.session ?? null;
  // якщо ти не прокидаєш session через ctx — беремо напряму
  // const session = getSession(ctx.chat.id);

  if (!session || !session.history || session.history.length === 0) {
    return ctx.answerCbQuery("⛔ Немає куди повертатись");
  }

  const prev = session.history.pop();

  session.step = prev.step;
  session.data = prev.data;

  await ctx.answerCbQuery();

  return renderStep(ctx, session);
}
