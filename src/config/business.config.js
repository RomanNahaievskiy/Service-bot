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
  SLOT_STEP_MINUTES: toInt(process.env.SLOT_STEP_MINUTES, 15), // інтервал між слотами

  // ресурси
  PORTAL_WASH_COUNT: toInt(process.env.PORTAL_WASH_COUNT, 2), // кількість портальних мийок
  MANUAL_WASH_COUNT: toInt(process.env.MANUAL_WASH_COUNT, 2), // кількість ручних мийок
  OIL_CHANGE_BAYS: toInt(process.env.OIL_CHANGE_BAYS, 1), // кількість майданчиків для заміни оливи
  TIRE_SERVICE_BAYS: toInt(process.env.TIRE_SERVICE_BAYS, 1), // кількість майданчиків для шиномонтажу
  SERVICE_BOX_COUNT: toInt(process.env.SERVICE_BOX_COUNT, 1), // кількість сервісних боксів

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
