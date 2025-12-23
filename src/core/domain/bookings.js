import { sheetsApi } from "../../integrations/sheetsApi.js";

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

  // +30 хв (можна потім зробити по сервісу)
  const end = new Date(start);
  end.setMinutes(end.getMinutes() + 30);

  return await sheetsApi.createBooking({
    tgId: String(data.chatId),
    fullName: data.fullName || "—",
    phone: data.phone || "",
    service: normalize(data.service),
    startsAt: start.toISOString(),
    endsAt: end.toISOString(),
    vehicle: `${normalize(data.vehicle)} ${data.vehicleNumber || ""}`.trim(),
    comment: "",
  });
}

function extractTimeHHMM(time) {
  const s = String(time || "");
  const m = s.match(/^TIME_(\d{1,2}:\d{2})$/);
  if (m) return m[1];
  throw new Error(`Invalid time format: ${s}`);
}

function normalize(v) {
  if (!v) return "";
  if (typeof v === "string") return v;
  return v.title || v.name || "";
}
