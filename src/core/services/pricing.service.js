import { sheetsApi } from "../../integrations/sheetsApi.js";
// кешування конфігурації цін
let cache = {
  ts: 0,
  ttlMs: 10 * 60 * 1000, // 10 хв
  data: null,
};
// отримати конфігурацію цін (з кешем)
export async function getPriceConfig() {
  const now = Date.now();
  if (cache.data && now - cache.ts < cache.ttlMs) return cache.data;

  const data = await sheetsApi.pricesGet(); // { vehicles, options }
  cache = { ...cache, ts: now, data };
  return data;
}
// перевірка чи застосовна опція для групи та ТЗ
function applicable(option, { group, vehicleId }) {
  const g = String(option.applicableGroup || "all").toLowerCase();
  const v = String(option.applicableVehicleId || "all").toLowerCase();

  const groupOk = g === "all" || g === String(group).toLowerCase();
  const vehicleOk = v === "all" || v === String(vehicleId).toLowerCase();

  return groupOk && vehicleOk;
}
// розрахунок ціни та тривалості послуги
export async function calcPricing({ vehicleId, group, optionIds = [] }) {
  const { vehicles, options } = await getPriceConfig();

  const vehicle = vehicles.find((v) => v.vehicleId === vehicleId);
  if (!vehicle) throw new Error(`Unknown vehicleId: ${vehicleId}`);

  const basePrice = Number(vehicle.basePrice || 0);
  const baseDurationMin = Number(vehicle.baseDurationMin || 0);

  const selected = options
    .filter((o) => optionIds.includes(o.optionId))
    .filter((o) => applicable(o, { group, vehicleId }));

  const optionsPrice = selected.reduce((s, o) => s + Number(o.price || 0), 0);
  const optionsDurationMin = selected.reduce(
    (s, o) => s + Number(o.durationMin || 0),
    0,
  );

  const totalPrice = basePrice + optionsPrice;
  const totalDurationMin = baseDurationMin + optionsDurationMin;

  return {
    vehicle, //можливо тут буде корисно vehicleId і vehicleTitle, щоб не шукати їх знову в сесії для confirm
    selectedOptions: selected,
    basePrice,
    baseDurationMin,
    optionsPrice,
    optionsDurationMin,
    totalPrice,
    totalDurationMin,
  };
}

export async function calcPricingWithPromo({
  vehicleId,
  group,
  optionIds = [],
  promo = null,
  serviceId = "wash",
  clientType = "retail",
}) {
  const pricing = await calcPricing({ vehicleId, group, optionIds });
  return applyPromoDiscount(pricing, {
    promo,
    serviceId,
    clientType,
  });
}

export function applyPromoDiscount(
  pricing,
  { promo = null, serviceId = "wash", clientType = "retail" } = {},
) {
  const originalTotalPrice = money(pricing?.totalPrice || 0);
  const base = {
    ...pricing,
    originalTotalPrice,
    discountAmount: 0,
    totalPrice: originalTotalPrice,
  };

  if (!promo?.valid) return base;
  if (String(clientType || "").toLowerCase() !== "retail") return base;
  if (!csvIncludes(promo.applicableServices || "all", serviceId)) return base;

  const eligibleAmount = getPromoEligibleAmount(base, promo);
  if (eligibleAmount <= 0) {
    return {
      ...base,
      promo: buildPromoPricingMeta(promo, "not_applicable_options"),
    };
  }

  const discountAmount = money(
    calcDiscountAmount({
      amount: eligibleAmount,
      discountType: promo.discountType,
      discountValue: promo.discountValue,
    }),
  );

  const safeDiscount = Math.min(discountAmount, originalTotalPrice);
  const totalPrice = money(originalTotalPrice - safeDiscount);

  return {
    ...base,
    discountAmount: safeDiscount,
    totalPrice,
    promo: buildPromoPricingMeta(promo, "applied"),
  };
}

function getPromoEligibleAmount(pricing, promo) {
  const applicableOptions = String(promo.applicableOptions || "all").trim();
  if (!applicableOptions || applicableOptions.toLowerCase() === "all") {
    return money(pricing.originalTotalPrice || pricing.totalPrice || 0);
  }

  const allowed = new Set(
    applicableOptions
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean),
  );

  return money(
    (pricing.selectedOptions || [])
      .filter((o) => allowed.has(String(o.optionId)))
      .reduce((sum, o) => sum + Number(o.price || 0), 0),
  );
}

function calcDiscountAmount({ amount, discountType, discountValue }) {
  const type = String(discountType || "").toLowerCase();
  const value = Number(discountValue || 0);

  if (!Number.isFinite(value) || value <= 0) return 0;

  if (type === "percent") return amount * (value / 100);
  if (type === "fixed") return value;
  if (type === "coefficient") return amount - amount * value;

  return 0;
}

function buildPromoPricingMeta(promo, status) {
  return {
    promoId: String(promo.promoId || ""),
    code: String(promo.code || promo.enteredCode || ""),
    tag: String(promo.tag || ""),
    discountType: String(promo.discountType || ""),
    discountValue: Number(promo.discountValue || 0),
    status,
  };
}

function csvIncludes(csv, value) {
  const raw = String(csv || "all").trim();
  if (!raw || raw.toLowerCase() === "all") return true;

  return raw
    .split(",")
    .map((x) => x.trim().toLowerCase())
    .includes(String(value || "").toLowerCase());
}

function money(value) {
  const n = Number(value || 0);
  if (!Number.isFinite(n)) return 0;
  return Math.round(n * 100) / 100;
}
