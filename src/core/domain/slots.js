import { BUSINESS_CONFIG } from "../../config/business.config.js";
import { timeToMinutes, minutesToTime } from "../../utils/dates.js";
import { sheetsApi } from "../../integrations/sheetsApi.js";

export function generateDaySlots({
  // генерує всі слоти дня
  serviceDuration,
  slotStep = BUSINESS_CONFIG.SLOT_STEP_MINUTES,
  forDate = new Date(),
  now = new Date(),
  leadTimeMinutes = 0,
}) {
  const startMinDay = timeToMinutes(BUSINESS_CONFIG.WORKDAY_START);
  const endMinDay = timeToMinutes(BUSINESS_CONFIG.WORKDAY_END);

  const dayKey = (d) => {
    const x = new Date(d);
    x.setHours(0, 0, 0, 0);
    return x.getTime();
  };

  const targetDay = dayKey(forDate);
  const today = dayKey(now);

  if (targetDay < today) return [];

  let startMin = startMinDay;

  if (targetDay === today) {
    const nowMinRaw = now.getHours() * 60 + now.getMinutes() + leadTimeMinutes;
    startMin = Math.max(startMinDay, ceilToStep(nowMinRaw, slotStep));
  }

  if (startMin + serviceDuration > endMinDay) return [];

  const slots = [];
  for (
    let cur = startMin;
    cur + serviceDuration <= endMinDay;
    cur += slotStep
  ) {
    slots.push({
      start: minutesToTime(cur),
      end: minutesToTime(cur + serviceDuration),
    });
  }
  return slots;
}

function ceilToStep(value, step) {
  // заокруглює value вгору до найближчого кратного step
  return Math.ceil(value / step) * step;
}

function toYYYYMMDD(dateObj) {
  // форматує дату в рядок "YYYY-MM-DD"
  const d = new Date(dateObj);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function overlaps(aStart, aEnd, bStart, bEnd) {
  // перевіряє, чи перетинаються два
  // інтервали [start, end)
  return aStart < bEnd && bStart < aEnd;
}

/**
 * ✅ Головна функція для UI: повертає тільки ВІЛЬНІ слоти
 * bookings беруться з Google Sheets через sheetsApi
 */
export async function getFreeDaySlots({
  forDate,
  serviceDuration,
  slotStep = BUSINESS_CONFIG.SLOT_STEP_MINUTES,
  now = new Date(),
  leadTimeMinutes = 0,
  status = "new", // можна "new|approved" як захочеш
}) {
  const allSlots = generateDaySlots({
    forDate,
    serviceDuration,
    slotStep,
    now,
    leadTimeMinutes,
  });
  if (!allSlots.length) return [];

  const dateISO = toYYYYMMDD(forDate);

  // 1) тягнемо бронювання за дату
  const bookingsRaw = await sheetsApi.listBookings({ dateISO });

  const bookings = (bookingsRaw || []).filter((b) => {
    const st = String(b.status || "").toLowerCase();
    return st === "new" || st === "approved";
  });

  // 2) перетворюємо бронювання в "хвилини дня"
  const busy = (bookings || [])
    .map((b) => {
      if (!b.startsAt || !b.endsAt) return null;
      const s = new Date(b.startsAt);
      const e = new Date(b.endsAt);
      if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) return null;
      return {
        startMin: s.getHours() * 60 + s.getMinutes(),
        endMin: e.getHours() * 60 + e.getMinutes(),
      };
    })
    .filter(Boolean);

  // 3) фільтруємо слоти, що перетинаються
  return allSlots.filter((slot) => {
    const sMin = timeToMinutes(slot.start);
    const eMin = timeToMinutes(slot.end);
    return !busy.some((b) => overlaps(sMin, eMin, b.startMin, b.endMin));
  });
}
