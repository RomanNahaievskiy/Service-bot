import { BUSINESS_CONFIG } from "../config/business.config.js";
import { STEPS } from "../core/fsm/steps.js";
import {
  formatHumanInTimeZone,
  formatISOInTimeZone,
} from "./timezone.js";

const sessions = new Map();

export function getSession(chatId) {
  if (!sessions.has(chatId)) {
    sessions.set(chatId, {
      step: STEPS.START,
      data: {},
      history: [],
    });
  }

  return sessions.get(chatId);
}

export function resetSession(chatId) {
  const prev = sessions.get(chatId);
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

export function toKyivISO(date) {
  if (!(date instanceof Date)) {
    throw new Error("toKyivISO expects Date");
  }

  return formatISOInTimeZone(date, BUSINESS_CONFIG.TIME_ZONE);
}

export function formatHumanDateFull(isoString) {
  return formatHumanInTimeZone(isoString, BUSINESS_CONFIG.TIME_ZONE);
}
