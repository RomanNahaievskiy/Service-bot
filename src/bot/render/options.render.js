import { Markup } from "telegraf";
import { applyPromoDiscount } from "../../core/services/pricing.service.js";
import { sheetsApi } from "../../integrations/sheetsApi.js";
import { safeEditOrReply } from "./safeEditOrReply.js";

export async function renderOptions(ctx, session) {
  await ensureContractPricingForOptions(session);

  const prices = session.data?.prices;
  const vehicleId = session.data?.vehicleId;
  const vehicleGroup = session.data?.vehicleGroup;

  if (!prices || !vehicleId) {
    return safeEditOrReply(
      ctx,
      "Неможливо показати додаткові послуги. Дані відсутні.",
      Markup.inlineKeyboard([[Markup.button.callback("Назад", "BACK")]]),
    );
  }

  const selected = session.data.optionIds ?? [];
  const isContract = session.data?.clientType === "contract";

  const options = prices.options.filter((o) => {
    if (!o.active) return false;
    if (o.applicableGroup !== "all" && o.applicableGroup !== vehicleGroup) {
      return false;
    }
    if (o.applicableVehicleId !== "all" && o.applicableVehicleId !== vehicleId) {
      return false;
    }
    return true;
  });

  const buttons = options.map((o) => {
    const isOn = selected.includes(o.optionId);
    const mark = isOn ? "✅" : "⬜";
    const label = isContract
      ? `${mark} ${o.optionTitle} (+ ${o.durationMin} хв)`
      : `${mark} ${o.optionTitle} (+${o.price} грн / ${o.durationMin} хв)`;

    return [Markup.button.callback(label, `OPT_TOGGLE_${o.optionId}`)];
  });

  const summary = isContract
    ? calculateSummaryContract(session)
    : calculateSummaryRetail(session);

  buttons.push([
    Markup.button.callback("Назад", "BACK"),
    Markup.button.callback("Продовжити", "OPT_DONE"),
  ]);

  const selectedTitles = selected
    .map((id) => prices.options.find((o) => o.optionId === id)?.optionTitle)
    .filter(Boolean);

  const selectedBlock = selectedTitles.length
    ? `\nВибрані послуги: ${selectedTitles.join(", ")}`
    : "";

  const contractVehicleBlock = isContract
    ? `Транспортний засіб: ${session.data.vehicleAlias || ""}. Тип: ${
        session.data.vehicleTitle || ""
      }\n`
    : "";

  return safeEditOrReply(
    ctx,
    `Додаткові послуги\n\n` +
      contractVehicleBlock +
      `${isContract ? "Вартість: згідно умов договору\n" : formatRetailSummary(summary)}` +
      `Тривалість: ${summary.totalDurationMin} хв` +
      selectedBlock,
    Markup.inlineKeyboard(buttons),
  );
}

function calculateSummaryRetail(session) {
  const prices = session.data.prices;
  const vehicleId = session.data.vehicleId;
  const selected = session.data.optionIds ?? [];
  const vehicle = prices.vehicles.find((v) => v.vehicleId === vehicleId);

  const basePrice = Number(vehicle?.basePrice || 0);
  const baseDurationMin = Number(vehicle?.baseDurationMin || 0);

  let optionsPrice = 0;
  let optionsDurationMin = 0;
  const selectedOptions = [];

  for (const optId of selected) {
    const opt = prices.options.find((o) => o.optionId === optId);
    if (!opt) continue;

    selectedOptions.push(opt);
    optionsPrice += Number(opt.price || 0);
    optionsDurationMin += Number(opt.durationMin || 0);
  }

  const pricing = applyPromoDiscount(
    {
      basePrice,
      baseDurationMin,
      optionsPrice,
      optionsDurationMin,
      selectedOptions,
      totalPrice: basePrice + optionsPrice,
      totalDurationMin: baseDurationMin + optionsDurationMin,
    },
    {
      promo: session.data.promo,
      serviceId: session.data.serviceId || "wash",
      clientType: session.data.clientType || "retail",
    },
  );

  session.data.pricing = { ...pricing, source: "retail" };
  console.log("Updated session.data.pricing for retail:", session.data.pricing);

  return session.data.pricing;
}

function formatRetailSummary(summary) {
  if (!summary?.discountAmount) {
    return `Поточна вартість: ${summary.totalPrice} грн\n`;
  }

  return (
    `Вартість: ${summary.originalTotalPrice} грн\n` +
    `Знижка: -${summary.discountAmount} грн\n` +
    `До сплати: ${summary.totalPrice} грн\n`
  );
}

function calculateSummaryContract(session) {
  const d = session.data || {};
  const selected = d.optionIds ?? [];
  const pl = d.pricing;

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

  d.summary = { totalPrice, totalDurationMin };
  session.data = d;

  return { totalPrice, totalDurationMin };
}

async function ensureContractPricingForOptions(session) {
  const d = session.data || {};
  if (d.clientType !== "contract") return;

  const contractNo = d.contractNo;
  const vehicleId = d.vehicleId;
  const serviceId = d.serviceId || "wash";

  if (!contractNo || !vehicleId) return;

  const key = `${contractNo}|${vehicleId}|${serviceId}`;

  if (d._contractPricingKey === key && d.pricing?.source === "contract") return;
  console.log("Fetching contract pricing for options from GAS...");

  const pricing = await sheetsApi.contractOptionPricesGet({
    contractNo,
    vehicleId,
    serviceId,
  });

  d.pricing = pricing;
  d._contractPricingKey = key;
  session.data = d;
  console.log("Contract pricing updated in session.data.pricing");
}
