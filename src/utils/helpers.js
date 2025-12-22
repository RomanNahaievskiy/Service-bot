import { STEPS } from "../core/fsm/steps.js";
const sessions = new Map(); // Зберігання сесій користувачів

export function getSession(chatId) {
  // Отримання сесії користувача
  if (!sessions.has(chatId)) {
    sessions.set(chatId, {
      step: STEPS.START,
      data: {},
    });
  }
  return sessions.get(chatId);
}

export function resetSession(chatId) {
  // Скидання сесії користувача до початкового валідного стану
  sessions.set(chatId, {
    step: STEPS.START,
    data: {},
  });
}
