function toInt(value, fallback) {
  const n = Number.parseInt(value, 10);
  return Number.isNaN(n) ? fallback : n;
}

function toBool(value, fallback = false) {
  if (value === undefined) return fallback;
  return value === "true" || value === true;
}

// РљРѕРЅС„С–РіСѓСЂР°С†С–СЏ Р±С–Р·РЅРµСЃ-Р»РѕРіС–РєРё
export const BUSINESS_CONFIG = {
  TIME_ZONE:
    process.env.BUSINESS_TIME_ZONE ?? process.env.APP_TIMEZONE ?? "Europe/Kyiv",

  // СЂРѕР±РѕС‡РёР№ С‡Р°СЃ
  WORKDAY_START: process.env.WORKDAY_START ?? "08:00",
  WORKDAY_END: process.env.WORKDAY_END ?? "20:00",

  // СЃР»РѕС‚Рё - С‚СЂРёРІР°Р»РѕСЃС‚С– РІ С…РІРёР»РёРЅР°С…
  SLOT_STEP_MINUTES: toInt(process.env.SLOT_STEP_MINUTES, 15), // С–РЅС‚РµСЂРІР°Р» РјС–Р¶ СЃР»РѕС‚Р°РјРё
  BREAKS: parseBreaks(process.env.BREAKS), // РїРµСЂРµСЂРІРё, РЅР°РїСЂРёРєР»Р°Рґ: '[{"start": "12:00", "end": "13:00"}, {"start": "17:00", "end": "17:30"}]'

  // РЅР°РіР°РґСѓРІР°РЅРЅСЏ
  REMINDER_ENABLED: toBool(process.env.REMINDER_ENABLED, true),
  REMINDER_BEFORE_HOURS: toInt(process.env.REMINDER_BEFORE_HOURS, 24),
  REMINDER_BEFORE_MINUTES: toInt(process.env.REMINDER_BEFORE_MINUTES, 0),

  SECOND_REMINDER_ENABLED: toBool(process.env.SECOND_REMINDER_ENABLED, false),
  SECOND_REMINDER_BEFORE_HOURS: toInt(
    process.env.SECOND_REMINDER_BEFORE_HOURS,
    2,
  ),
};

function parseBreaks(envValue) {
  if (!envValue) return [];

  try {
    const parsed = JSON.parse(envValue);

    if (!Array.isArray(parsed)) return [];

    return parsed
      .map((b) => {
        if (!b?.start || !b?.end) return null;
        return { start: String(b.start), end: String(b.end) };
      })
      .filter(Boolean);
  } catch (e) {
    console.warn("вќЊ Invalid BREAKS in .env");
    return [];
  }
}

