import { BUSINESS_CONFIG } from "../../config/business.config.js";
import {
  addDaysYMD,
  parseYMD,
  todayYMD,
  ymdFromDateLike,
} from "../../utils/timezone.js";

export function resolveDateByCallback(callback) {
  const today = todayYMD(BUSINESS_CONFIG.TIME_ZONE);

  switch (callback) {
    case "DATE_TODAY":
      return today;

    case "DATE_TOMORROW":
      return addDaysYMD(today, 1);

    default:
      return null;
  }
}

export function formatDate(date) {
  const ymd = ymdFromDateLike(date, BUSINESS_CONFIG.TIME_ZONE);
  const { year, month, day } = parseYMD(ymd);

  return [
    String(day).padStart(2, "0"),
    String(month).padStart(2, "0"),
    year,
  ].join(".");
}
