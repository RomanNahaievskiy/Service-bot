// генерує всі слоти дня
// [
//   { start: '09:00', end: '09:30' },
//   { start: '09:15', end: '09:45' },
//   ...
// ]

import { BUSINESS_CONFIG } from "../../config/business.config.js";
import { timeToMinutes, minutesToTime } from "../../utils/dates.js";

export function generateDaySlots({
  serviceDuration,
  slotStep = BUSINESS_CONFIG.SLOT_STEP_MINUTES,
}) {
  const startMin = timeToMinutes(BUSINESS_CONFIG.WORKDAY_START);
  const endMin = timeToMinutes(BUSINESS_CONFIG.WORKDAY_END);

  const slots = [];

  for (
    let current = startMin;
    current + serviceDuration <= endMin;
    current += slotStep
  ) {
    slots.push({
      start: minutesToTime(current),
      end: minutesToTime(current + serviceDuration),
    });
  }

  return slots;
}
