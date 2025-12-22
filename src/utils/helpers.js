const sessions = new Map();

export function getSession(chatId) {
  if (!sessions.has(chatId)) {
    sessions.set(chatId, {});
  }
  return sessions.get(chatId);
}
