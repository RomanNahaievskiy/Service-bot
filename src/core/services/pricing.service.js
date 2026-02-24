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
  console.log("calcPricing", options[0]); //DBG
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
