import { STEPS } from "../../core/fsm/steps.js";
import { getSession } from "../../utils/helpers.js";
import { renderStep } from "../render/renderStep.js";

export async function optionsToggleHandler(ctx) {
  console.log("🔘 optionsToggleHandler", ctx.callbackQuery.data);

  const chatId =
    ctx.chat?.id ??
    ctx.callbackQuery?.message?.chat?.id ??
    ctx.update?.callback_query?.message?.chat?.id;

  const session = getSession(chatId);

  // FSM guard
  if (session.step !== STEPS.OPTIONS) {
    return ctx.answerCbQuery();
  }

  const optionId = ctx.callbackQuery.data.replace("OPT_TOGGLE_", "");

  session.data.optionIds ??= [];

  // const idx = session.data.optionIds.indexOf(optionId);

  // if (idx >= 0) {
  //   // ❌ вимикаємо
  //   session.data.optionIds.splice(idx, 1);
  // } else {
  //   // ✅ вмикаємо
  //   session.data.optionIds.push(optionId);
  // }
  const prices = session.data?.prices;
  const allOptions = prices?.options ?? [];
  const opt = allOptions.find((o) => String(o.optionId) === String(optionId));

  if (!opt) {
    console.log("⚠️ option not found in prices.options:", optionId);
    await ctx.answerCbQuery();
    return renderStep(ctx, session);
  }

  const selected = session.data.optionIds;
  //optionTitles
  session.data.optionTitles =
    selected.length > 0
      ? selected
          .map((id) =>
            allOptions.find((o) => String(o.optionId) === String(id)),
          )
          .filter(Boolean) // якщо опція з якихось причин не знайдеться (хоча має бути), то просто пропускаємо її, щоб не було помилки
          .map((o) => o.optionTitle)
      : [];
  const isSelected = selected.includes(optionId);

  if (isSelected) {
    // вимикаємо
    session.data.optionIds = selected.filter((id) => id !== optionId);
  } else {
    // вмикаємо
    if (String(opt.selectMode).toLowerCase() === "single") {
      const grp = String(opt.optionGroup || "");
      if (grp) {
        // прибрати інші з цієї ж групи
        const inSameGroup = new Set(
          allOptions
            .filter((o) => String(o.optionGroup || "") === grp)
            .map((o) => String(o.optionId)),
        );
        session.data.optionIds = selected.filter(
          (id) => !inSameGroup.has(String(id)),
        );
      } else {
        // якщо optionGroup порожній, то single "глобальний"
        session.data.optionIds = [];
      }
    }
    session.data.optionIds.push(optionId);
  }

  await ctx.answerCbQuery();

  // просто перемальовуємо той самий крок
  return renderStep(ctx, session);
}
