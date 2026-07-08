export const DEFAULT_TIME_ZONE = "Europe/Kyiv";

export function getZonedParts(date, timeZone = DEFAULT_TIME_ZONE) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    hour12: false,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(date);

  const get = (type) => parts.find((p) => p.type === type)?.value;

  return {
    year: get("year"),
    month: get("month"),
    day: get("day"),
    hour: get("hour"),
    minute: get("minute"),
    second: get("second"),
  };
}

export function formatYMDInTimeZone(date, timeZone = DEFAULT_TIME_ZONE) {
  const p = getZonedParts(date, timeZone);
  return `${p.year}-${p.month}-${p.day}`;
}

export function getMinutesOfDayInTimeZone(date, timeZone = DEFAULT_TIME_ZONE) {
  const p = getZonedParts(date, timeZone);
  return Number(p.hour) * 60 + Number(p.minute);
}

export function todayYMD(timeZone = DEFAULT_TIME_ZONE, now = new Date()) {
  return formatYMDInTimeZone(now, timeZone);
}

export function addDaysYMD(ymd, days) {
  const { year, month, day } = parseYMD(ymd);
  const d = new Date(Date.UTC(year, month - 1, day + days, 12, 0, 0, 0));
  return [
    d.getUTCFullYear(),
    String(d.getUTCMonth() + 1).padStart(2, "0"),
    String(d.getUTCDate()).padStart(2, "0"),
  ].join("-");
}

export function compareYMD(a, b) {
  return String(a).localeCompare(String(b));
}

export function parseYMD(ymd) {
  const m = String(ymd || "").match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) throw new Error(`Invalid date format: ${ymd}`);

  return {
    year: Number(m[1]),
    month: Number(m[2]),
    day: Number(m[3]),
  };
}

export function ymdToDateAtNoonUTC(ymd) {
  const { year, month, day } = parseYMD(ymd);
  return new Date(Date.UTC(year, month - 1, day, 12, 0, 0, 0));
}

export function ymdFromDateLike(value, timeZone = DEFAULT_TIME_ZONE) {
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid date value: ${value}`);
  }

  return formatYMDInTimeZone(date, timeZone);
}

export function zonedDateTimeToDate(
  ymd,
  hhmm,
  timeZone = DEFAULT_TIME_ZONE,
) {
  const { year, month, day } = parseYMD(ymd);
  const m = String(hhmm || "").match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  if (!m) throw new Error(`Invalid time format: ${hhmm}`);

  const hour = Number(m[1]);
  const minute = Number(m[2]);
  const second = Number(m[3] || 0);
  const localAsUTC = Date.UTC(year, month - 1, day, hour, minute, second, 0);

  let candidate = new Date(
    localAsUTC - getTimeZoneOffsetMinutes(new Date(localAsUTC), timeZone) * 60000,
  );
  const corrected = new Date(
    localAsUTC - getTimeZoneOffsetMinutes(candidate, timeZone) * 60000,
  );

  if (corrected.getTime() !== candidate.getTime()) {
    candidate = corrected;
  }

  return candidate;
}

export function formatISOInTimeZone(date, timeZone = DEFAULT_TIME_ZONE) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    throw new Error("formatISOInTimeZone expects a valid Date");
  }

  const p = getZonedParts(date, timeZone);
  const offsetMin = getTimeZoneOffsetMinutes(date, timeZone);
  const sign = offsetMin >= 0 ? "+" : "-";
  const abs = Math.abs(offsetMin);
  const oh = String(Math.floor(abs / 60)).padStart(2, "0");
  const om = String(abs % 60).padStart(2, "0");

  return `${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}:${p.second}${sign}${oh}:${om}`;
}

export function formatHumanInTimeZone(
  value,
  timeZone = DEFAULT_TIME_ZONE,
  locale = "uk-UA",
) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "Некоректна дата";

  return new Intl.DateTimeFormat(locale, {
    timeZone,
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getTimeZoneOffsetMinutes(date, timeZone) {
  const p = getZonedParts(date, timeZone);
  const localAsUTC = Date.UTC(
    Number(p.year),
    Number(p.month) - 1,
    Number(p.day),
    Number(p.hour),
    Number(p.minute),
    Number(p.second),
    0,
  );

  return Math.round((localAsUTC - date.getTime()) / 60000);
}
