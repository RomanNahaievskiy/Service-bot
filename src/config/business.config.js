function toInt(value, fallback) {
  const n = Number.parseInt(value, 10);
  return Number.isNaN(n) ? fallback : n;
}

function toBool(value, fallback = false) {
  if (value === undefined) return fallback;
  return value === "true" || value === true;
}

// Конфігурація бізнес-логіки
export const BUSINESS_CONFIG = {
  // робочий час
  WORKDAY_START: process.env.WORKDAY_START ?? "08:00",
  WORKDAY_END: process.env.WORKDAY_END ?? "20:00",

  // слоти - тривалості в хвилинах
  SLOT_STEP_MINUTES: toInt(process.env.SLOT_STEP_MINUTES, 15),

  // ресурси
  PORTAL_WASH_COUNT: toInt(process.env.PORTAL_WASH_COUNT, 2),
  SERVICE_BOX_COUNT: toInt(process.env.SERVICE_BOX_COUNT, 1),

  // нагадування
  REMINDER_ENABLED: toBool(process.env.REMINDER_ENABLED, true),
  REMINDER_BEFORE_HOURS: toInt(process.env.REMINDER_BEFORE_HOURS, 24),
  REMINDER_BEFORE_MINUTES: toInt(process.env.REMINDER_BEFORE_MINUTES, 0),

  SECOND_REMINDER_ENABLED: toBool(process.env.SECOND_REMINDER_ENABLED, false),
  SECOND_REMINDER_BEFORE_HOURS: toInt(
    process.env.SECOND_REMINDER_BEFORE_HOURS,
    2
  ),
};
