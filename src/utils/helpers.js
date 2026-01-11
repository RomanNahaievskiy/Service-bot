import { STEPS } from "../core/fsm/steps.js";
const sessions = new Map(); // Зберігання сесій користувачів

export function getSession(chatId) {
  // Отримання сесії користувача
  if (!sessions.has(chatId)) {
    sessions.set(chatId, {
      step: STEPS.START,
      data: {},
      history: [], // Історія кроків користувача
    });
  }
  return sessions.get(chatId);
}

export function resetSession(chatId) {
  const prev = sessions.get(chatId);
  // Скидання сесії користувача, збереження деяких даних
  const keep = {
    client: prev?.data?.client ?? null,
    phone: prev?.data?.phone ?? "",
    fullName: prev?.data?.fullName ?? "",
  };

  sessions.set(chatId, {
    step: STEPS.START,
    data: keep,
    history: [],
  });
}

/**
 * Повертає ISO-рядок у часовому поясі Europe/Kyiv
 * з коректним офсетом (+02:00 / +03:00)
 */
export function toKyivISO(date) {
  if (!(date instanceof Date)) {
    throw new Error("toKyivISO expects Date");
  }

  const tz = "Europe/Kyiv";

  const parts = new Intl.DateTimeFormat("sv-SE", {
    timeZone: tz,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(date);

  const get = (t) => parts.find((p) => p.type === t)?.value;

  const y = get("year");
  const m = get("month");
  const d = get("day");
  const h = get("hour");
  const min = get("minute");
  const s = get("second");

  // офсет для цієї дати (з урахуванням DST)
  const offsetMin = -date.getTimezoneOffset();
  const sign = offsetMin >= 0 ? "+" : "-";
  const oh = String(Math.floor(Math.abs(offsetMin) / 60)).padStart(2, "0");
  const om = String(Math.abs(offsetMin) % 60).padStart(2, "0");

  return `${y}-${m}-${d}T${h}:${min}:${s}${sign}${oh}:${om}`;
}
