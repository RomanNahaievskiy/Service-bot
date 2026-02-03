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

  return await sheetsApi.createBooking({
    tgId: String(data.chatId),
    fullName: data.fullName || "—",
    phone: data.phone || "",
    service: normalize(data.service), //servise.serviseId? || service.title || service.name || ""
    startsAt: toKyivISO(start), // у форматі ISO з часовою зоною Києва замість start.toISOString()
    endsAt: toKyivISO(end), // у форматі ISO з часовою зоною Києва замість end.toISOString()
    vehicle: `${normalize(data.vehicle)} ${data.vehicleNumber || ""}`.trim(),
    comment: "",
  });
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
