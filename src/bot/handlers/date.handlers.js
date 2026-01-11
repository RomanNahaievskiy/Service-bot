// import { STEPS } from "../../core/fsm/steps.js";
// import { getSession } from "../../utils/helpers.js";
// import { resolveDateByCallback, formatDate } from "../../core/domain/dates.js";
// import { goToStep } from "../../core/fsm/transition.js";
// import { renderStep } from "../render/renderStep.js";

// export async function dateHandler(ctx) {
//   console.log("📅 dateHandler", ctx.callbackQuery.data); //test

//   const session = getSession(ctx.chat.id);
//   const callback = ctx.callbackQuery.data;

//   // FSM guard
//   if (session.step !== STEPS.DATE) {
//     return ctx.answerCbQuery();
//   }

//   const date = resolveDateByCallback(callback);

//   if (!date) {
//     return ctx.answerCbQuery("Невідома дата");
//   }

//   session.data.date = date;
//   // session.step = STEPS.TIME;
//   // Переходимо до вибору часу
//   goToStep(session, STEPS.TIME);

//   await ctx.answerCbQuery(); // Підтвердження обробки колбеку для телеграма

//   return renderStep(ctx, session);
// }
import { STEPS } from "../../core/fsm/steps.js";
import { getSession } from "../../utils/helpers.js";
import { goToStep } from "../../core/fsm/transition.js";
import { renderStep } from "../render/renderStep.js";

function parseDateFromCb(data) {
  // DATE_2026-01-11
  const m = String(data || "").match(/^DATE_(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return null;

  const y = Number(m[1]);
  const mo = Number(m[2]) - 1;
  const d = Number(m[3]);

  const dt = new Date(y, mo, d, 0, 0, 0, 0);
  return Number.isNaN(dt.getTime()) ? null : dt;
}

export async function datePickHandler(ctx) {
  console.log("📅 datePickHandler", ctx.callbackQuery.data); //test
  const cb = ctx.callbackQuery?.data;

  const chatId =
    ctx.chat?.id ??
    ctx.callbackQuery?.message?.chat?.id ??
    ctx.update?.callback_query?.message?.chat?.id;

  const session = getSession(chatId);

  if (session.step !== STEPS.DATE) {
    return ctx.answerCbQuery();
  }

  const dateObj = parseDateFromCb(cb);
  if (!dateObj) {
    await ctx.answerCbQuery("❌ Невірна дата", { show_alert: true });
    return;
  }

  // ✅ зберігаємо як Date — щоб timeHandler не спотикався
  session.data.date = dateObj;

  // очистимо слоти попередньої дати
  session.data.timeSlots = null;
  session.data.timeSlotsError = null;

  await ctx.answerCbQuery("✅ Дата обрана");

  // далі йдемо на TIME або на “підбір часу” (як у твоїй FSM)
  goToStep(session, STEPS.TIME);

  return renderStep(ctx, session);
}
