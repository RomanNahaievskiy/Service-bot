import { calcPricing } from "../../core/services/pricing.service.js"; // шлях під себе
import { renderStep } from "../render/renderStep.js";
import { goToStep } from "../../core/fsm/transition.js";
import { STEPS } from "../fsm/steps.js"; // або константи кроків

export async function optionsDoneHandler(ctx) {
  console.log("✅ optionsDoneHandler triggered");

  const session = ctx.session;
  session.data = session.data ?? {};
  session.data.order = session.data.order ?? {};

  // у тебе може бути або session.data.vehicleId / group / optionIds,
  // або session.data.order.vehicleId ... — нижче універсально:
  const vehicleId = session.data.vehicleId ?? session.data.order.vehicleId;
  const group = session.data.group ?? session.data.order.group;
  const optionIds =
    session.data.optionIds ?? session.data.order.optionIds ?? [];

  if (!vehicleId) {
    await ctx.answerCbQuery("⚠️ Спочатку оберіть тип транспорту", {
      show_alert: true,
    });
    // повертаємо на потрібний крок
    goToStep(session, STEPS.VEHICLE_TYPE);
    return renderStep(ctx, session);
  }

  try {
    const pricing = await calcPricing({ vehicleId, group, optionIds });

    // зберігаємо розрахунок
    session.data.pricing = pricing;

    // для зручності можна зберегти totals окремо
    session.data.totalPrice = pricing.totalPrice;
    session.data.totalDurationMin = pricing.totalDurationMin;

    await ctx.answerCbQuery("✅ Опції збережено");

    // ⬇️ НАСТУПНИЙ КРОК — підстав свій:
    // наприклад: вибір дати / часу / підтвердження
    goToStep(session, STEPS.DATE); // <--- ЗМІНИ НА СВІЙ КРОК

    return renderStep(ctx, session);
  } catch (e) {
    console.error("❌ calcPricing failed:", e);
    await ctx.answerCbQuery("❌ Не вдалося порахувати вартість", {
      show_alert: true,
    });

    // залишаємося на опціях, щоб не ламати флоу
    goToStep(session, STEPS.OPTIONS);
    return renderStep(ctx, session);
  }
}
