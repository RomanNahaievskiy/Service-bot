import { calcPricing } from "../../core/services/pricing.service.js";
import { renderStep } from "../render/renderStep.js";
import { STEPS } from "../../core/fsm/steps.js";
import { goToStep } from "../../core/fsm/transition.js";
import { getSession } from "../../utils/helpers.js"; // <-- у тебе воно є
import { sheetsApi } from "../../integrations/sheetsApi.js"; // залежність для контрактного прайсу

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
      chatId,
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
    session.data.vehicleGroup ||
    session.data?.prices?.vehicles?.find((v) => v.vehicleId === vehicleId)
      ?.group ||
    "passenger";
  session.data.vehicleGroup = group; // щоб далі було стабільно

  const optionIds = session.data.optionIds ?? [];
  session.data.optionIds = optionIds; // щоб поле було канонічним

  //optionTitles зберігаємо в сесію ( але варто коли вже всі toggle відпрацюють, щоб не шукати кожного разу по id в прайсі)
  session.data.optionTitles =
    selected.length > 0
      ? selected
          .map((id) =>
            allOptions.find((o) => String(o.optionId) === String(id)),
          )
          .filter(Boolean) // якщо опція з якихось причин не знайдеться (хоча має бути), то просто пропускаємо її, щоб не було помилки
          .map((o) => o.optionTitle)
      : [];

  console.log("DBG optionsDoneHandler", session.data.optionTitles);

  if (!vehicleId) {
    await ctx.answerCbQuery("⚠️ Спочатку оберіть тип транспорту", {
      show_alert: true,
    });
    goToStep(session, STEPS.VEHICLE_TYPE);
    return renderStep(ctx, session);
  }
  console.log("DBG", { vehicleId, group, optionIds, step: session.step });

  try {
    if (session.data.clientType === "contract") {
      // ✅ contract: totals рахуємо локально з прайс-листа, GAS тут не чіпаємо
      const totals = calcContractTotals_(session);
      session.data.pricingTotals = totals; // для DATE/CONFIRM
      // чи можна тут  зробити канонічну структуру для прайсу, щоб CONFIRM не заморочувався і просто брав звідси? наприклад, session.data.pricing = { totalPrice, totalDurationMin, source: "contract" }
      session.data.pricing = {
        ...session.data.pricing, // ← зберігаємо basePrice + optionsPriceList
        totalPrice: totals.totalPrice,
        totalDurationMin: totals.totalDurationMin,
        source: "contract",
      };
    } else {
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
    }
    await ctx.answerCbQuery("✅ Готово");

    if (session.data.clientType === "contract") {
      goToStep(session, STEPS.DATE);
    } else {
      goToStep(session, STEPS.VEHICLE_DATA);
    }

    return renderStep(ctx, session);
  } catch (e) {
    console.error("❌ calcPricing failed:", e);
    await ctx.answerCbQuery("❌ Помилка розрахунку", { show_alert: true });
    return renderStep(ctx, session);
  }
}

function calcContractTotals_(session) {
  const d = session.data || {};
  const pl = d.pricing; // { basePrice, baseDurationMin, optionsPriceList, ... }
  const selected = d.optionIds ?? [];

  const basePrice = Number(pl?.basePrice || 0);
  const baseDurationMin = Number(pl?.baseDurationMin || 0);

  const map = new Map(
    (pl?.optionsPriceList || []).map((o) => [String(o.optionId), o]),
  );

  let totalPrice = basePrice;
  let totalDurationMin = baseDurationMin;

  for (const id of selected) {
    const o = map.get(String(id));
    if (!o) continue;
    totalPrice += Number(o.price || 0);
    totalDurationMin += Number(o.durationMin || 0);
  }

  return { totalPrice, totalDurationMin };
}
