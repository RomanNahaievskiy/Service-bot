import { calcPricing } from "../../core/services/pricing.service.js";
import { renderStep } from "../render/renderStep.js";
import { STEPS } from "../../core/fsm/steps.js";
import { goToStep } from "../../core/fsm/transition.js";

export async function optionsDoneHandler(ctx) {
  console.log("✅ optionsDoneHandler triggered");

  const session = ctx.session; // ✅ головне
  session.data = session.data ?? {};

  // (не обов’язково, але корисно)
  if (session.step !== STEPS.OPTIONS) {
    return ctx.answerCbQuery();
  }

  const vehicleId = session.data.vehicleId;
  const group = session.data.vehicleGroup; // якщо в тебе інша назва — нижче дам варіант
  const optionIds = session.data.options ?? [];

  if (!vehicleId) {
    await ctx.answerCbQuery("⚠️ Спочатку оберіть тип транспорту", {
      show_alert: true,
    });
    goToStep(session, STEPS.VEHICLE_TYPE);
    return renderStep(ctx, session);
  }

  try {
    console.log("DBG", { vehicleId, group, optionIds, step: session.step }); // debug
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

    // після опцій у тебе (судячи з флоу) — введення даних ТЗ
    goToStep(session, STEPS.VEHICLE_DATA);
    return renderStep(ctx, session);
  } catch (e) {
    console.error("❌ calcPricing failed:", e);
    await ctx.answerCbQuery("❌ Помилка розрахунку", { show_alert: true });
    return renderStep(ctx, session);
  }
}
