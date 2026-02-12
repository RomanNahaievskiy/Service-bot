import { sheetsApi } from "../../integrations/sheetsApi.js";
import { toKyivISO } from "../../utils/helpers.js";

export async function createBooking(data) {
  const dateObj = data.date; // Очікуємо Date об'єкт
  if (!(dateObj instanceof Date)) {
    throw new Error("Invalid date object in session");
  }

  const timeHHMM = extractTimeHHMM(data.time); // TIME_15:45 → 15:45

  // Формуємо start
  const start = new Date(dateObj);
  const [hh, mm] = timeHHMM.split(":");
  start.setHours(Number(hh), Number(mm), 0, 0);

  if (Number.isNaN(start.getTime())) {
    throw new Error("Invalid start datetime");
  }

  // ✅ тривалість з послуги
  // const duration = Number(data.service?.duration ?? 30);
  const duration = Number(
    data?.pricing?.totalDurationMin ??
      data?.service?.durationMin ??
      data?.service?.duration ??
      30,
  );

  const safeDuration =
    Number.isFinite(duration) && duration > 0 ? duration : 30;

  const end = new Date(start);
  end.setMinutes(end.getMinutes() + safeDuration);

  const optionIdsArr = Array.isArray(data.optionIds)
    ? data.optionIds
    : String(data.optionIds || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

  const totalPrice = Number(data?.pricing?.totalPrice ?? data?.totalPrice ?? 0);

  // Формуємо корисне навантаження для Sheets API відповідно до контракту(схеми) в Sheets API
  const payload = {
    id: String(data.id || crypto.randomUUID()),
    createdAt: String(data.createdAt || now),

    // клієнт
    tgId: String(data.tgId || data.userId || ""), // ✅ tgId користувача
    fullName: String(data.fullName || "—"),
    phone: String(data.phone || ""),

    // B2B
    clientType: String(data.clientType || "retail"),
    contractNo: String(
      data.clientType === "contract" ? data.contractNo || "" : "",
    ),

    // послуга/ТЗ
    serviceId: String(
      data.serviceId || data?.service?.serviceId || data?.service?.id || "",
    ),
    serviceTitle: String(
      data.serviceTitle || data?.service?.title || data?.service?.name || "—",
    ),

    vehicleId: String(
      data.vehicleId || data?.vehicle?.vehicleId || data?.vehicle?.id || "",
    ),
    vehicleTitle: String(
      data.vehicleTitle ||
        data?.prices?.vehicles?.find((v) => v.vehicleId === data?.vehicleId)
          ?.vehicleTitle ||
        data?.vehicle?.title ||
        data?.vehicle?.name ||
        (typeof data.vehicle === "string" ? data.vehicle : "") ||
        "—",
    ),
    vehicleNumber: String(data.vehicleNumber || ""),

    // дати
    startsAt: toKyivISO(start),
    endsAt: toKyivISO(end),

    // опції/прайс
    optionIds: optionIdsArr.join(","),
    totalPrice: Number.isFinite(totalPrice) ? totalPrice : 0,
    totalDurationMin: safeDuration,

    // службове
    comment: String(data.comment || ""),
    status: String(data.status || "new"),
    admin: String(data.admin || ""),
    updatedAt: String(now),
  };

  return await sheetsApi.createBooking(payload);
}

function extractTimeHHMM(time) {
  const s = String(time || "").trim();

  // TIME_19:00 -> 19:00
  let m = s.match(/^TIME_(\d{1,2}):(\d{2})$/);
  if (m) return `${m[1].padStart(2, "0")}:${m[2]}`;

  // 19:00 -> 19:00
  m = s.match(/^(\d{1,2}):(\d{2})$/);
  if (m) return `${m[1].padStart(2, "0")}:${m[2]}`;

  // 19:00:00 -> 19:00
  m = s.match(/^(\d{1,2}):(\d{2}):\d{2}$/);
  if (m) return `${m[1].padStart(2, "0")}:${m[2]}`;

  throw new Error(`Invalid time format: ${s}`);
}

function normalize(v) {
  if (!v) return "";
  if (typeof v === "string") return v;
  return v.title || v.name || "";
}
