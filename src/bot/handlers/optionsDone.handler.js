import { calcPricing } from "../../core/services/pricing.service.js";
import { renderStep } from "../render/renderStep.js";
import { STEPS } from "../../core/fsm/steps.js";
import { goToStep } from "../../core/fsm/transition.js";
import { getSession } from "../../utils/helpers.js"; // <-- у тебе воно є

export async function optionsDoneHandler(ctx) {
  console.log("✅ optionsDoneHandler triggered");

  // ✅ callback_query НЕ має ctx.chat, тому беремо так
  const chatId =
    ctx.chat?.id ??
    ctx.callbackQuery?.message?.chat?.id ??
    ctx.update?.callback_query?.message?.chat?.id;

  if (!chatId) {
    console.error("❌ optionsDoneHandler: chatId not found");
    return ctx.answerCbQuery("❌ Помилка чату", { show_alert: true });
  }

  const session = getSession(chatId);
  if (!session) {
    console.error(
      "❌ optionsDoneHandler: session not found for chatId",
      chatId
    );
    return ctx.answerCbQuery("⚠️ Сесія не знайдена. Натисніть /start", {
      show_alert: true,
    });
  }

  session.data = session.data ?? {};

  // якщо хочеш — можна не блокувати, але краще guard
  if (session.step !== STEPS.OPTIONS) {
    return ctx.answerCbQuery();
  }

  const vehicleId = session.data.vehicleId;
  const group =
    session.data.vehicleGroup ??
    session.data.group ??
    session.data.vehicle_group; // універсально
  const optionIds = session.data.options ?? [];

  if (!vehicleId) {
    await ctx.answerCbQuery("⚠️ Спочатку оберіть тип транспорту", {
      show_alert: true,
    });
    goToStep(session, STEPS.VEHICLE_TYPE);
    return renderStep(ctx, session);
  }
  console.log("DBG", { vehicleId, group, optionIds, step: session.step });

  try {
    const pricing = await calcPricing({ vehicleId, group, optionIds });

    session.data.pricing = {
      totalPrice: pricing.totalPrice,
      totalDurationMin: pricing.totalDurationMin,
      basePrice: pricing.basePrice,
      baseDurationMin: pricing.baseDurationMin,
      optionsPrice: pricing.optionsPrice,
      optionsDurationMin: pricing.optionsDurationMin,
      selectedOptions: pricing.selectedOptions,
    };

    await ctx.answerCbQuery("✅ Готово");

    goToStep(session, STEPS.VEHICLE_DATA); // наступний крок у твоєму флоу
    return renderStep(ctx, session);
  } catch (e) {
    console.error("❌ calcPricing failed:", e);
    await ctx.answerCbQuery("❌ Помилка розрахунку", { show_alert: true });
    return renderStep(ctx, session);
  }
}
