import { BUSINESS_CONFIG } from "../../config/business.config.js";

function timeToMinutes(time) {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function minutesToTime(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function generateTimeSlots(date) {
  const start = timeToMinutes(BUSINESS_CONFIG.WORKDAY_START);
  const end = timeToMinutes(BUSINESS_CONFIG.WORKDAY_END);
  const step = BUSINESS_CONFIG.SLOT_STEP_MINUTES; // інтервал між слотами

  const slots = [];

  for (let t = start; t + step <= end; t += step) {
    // змінено умову, щоб уникнути виходу за межі робочого часу
    slots.push({
      label: minutesToTime(t),
      value: minutesToTime(t),
      date,
    });
  }

  return slots;
}
