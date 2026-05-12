import { Markup } from "telegraf";
import { safeEditOrReply } from "./safeEditOrReply.js";
import { sheetsApi } from "../../integrations/sheetsApi.js";

export async function renderOptions(ctx, session) {
  await ensureContractPricingForOptions(session);

  const prices = session.data?.prices;

  const vehicleId = session.data?.vehicleId;
  const vehicleGroup = session.data?.vehicleGroup;

  if (!prices || !vehicleId) {
    return safeEditOrReply(
      ctx,
      "❌ Неможливо показати додаткові послуги. Дані відсутні.",
      Markup.inlineKeyboard([[Markup.button.callback("⬅️ Назад", "BACK")]]),
    );
  }

  const selected = session.data.optionIds ?? [];

  const options = prices.options.filter((o) => {
    if (!o.active) return false;
    if (o.applicableGroup !== "all" && o.applicableGroup !== vehicleGroup)
      return false;
    if (o.applicableVehicleId !== "all" && o.applicableVehicleId !== vehicleId)
      return false;
    return true;
  });

  const isContract = session.data?.clientType === "contract";
  const buttons = options.map((o) => {
    const isOn = selected.includes(o.optionId);
    const mark = isOn ? "✅" : "⬜️";

    const label = isContract
      ? `${mark} ${o.optionTitle} (+ ${o.durationMin} хв)`
      : `${mark} ${o.optionTitle}(+${o.price} грн / ${o.durationMin} хв)`;
    return [Markup.button.callback(label, `OPT_TOGGLE_${o.optionId}`)];
  });

  let summary;
  if (session.data.clientType === "contract") {
    summary = calculateSummaryContract(session);
  } else {
    summary = calculateSummaryRetail(session);
  }

  buttons.push([
    Markup.button.callback("⬅️ Назад", "BACK"),
    Markup.button.callback("➡️ Продовжити", "OPT_DONE"),
  ]);

  return safeEditOrReply(
    ctx,
    `➕ Додаткові послуги\n\n` +
      `${isContract ? "Транспортний засіб: " + session.data.vehicleAlias + ". Тип: " + session.data.vehicleTitle + "\n" : ""}` +
      `${isContract ? "💰 Вартість згідно умов договору " : `💰 Поточна вартість: ${summary.totalPrice} грн\n`} ` +
      `⏱ Тривалість: ${summary.totalDurationMin} хв\n
      ${
        selected.length > 0
          ? `📋 Вибрані послуги: ${selected
              .map(
                (id) =>
                  prices.options.find((o) => o.optionId === id)?.optionTitle,
              )
              .filter(Boolean)
              .join(", ")}`
          : ""
      }`,
    Markup.inlineKeyboard(buttons),
  );
}

function calculateSummaryRetail(session) {
  const prices = session.data.prices;
  const vehicleId = session.data.vehicleId;
  const selected = session.data.optionIds ?? [];

  const vehicle = prices.vehicles.find((v) => v.vehicleId === vehicleId);

  let totalPrice = vehicle?.basePrice ?? 0;
  let totalDurationMin = vehicle?.baseDurationMin ?? 0;

  for (const optId of selected) {
    const opt = prices.options.find((o) => o.optionId === optId);
    if (!opt) continue;
    totalPrice += opt.price || 0;
    totalDurationMin += opt.durationMin || 0;
  }

  session.data.pricing = { totalPrice, totalDurationMin, source: "retail" };
  console.log("Updated session.data.pricing for retail:", session.data.pricing);
  return { totalPrice, totalDurationMin };
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
  console.log("🔄 Fetching contract pricing for options from GAS...");

  const pricing = await sheetsApi.contractOptionPricesGet({
    contractNo,
    vehicleId,
    serviceId,
  });

  d.pricing = pricing;
  d._contractPricingKey = key;
  session.data = d;
  console.log("✅ Contract pricing updated in session.data.pricing");
}
