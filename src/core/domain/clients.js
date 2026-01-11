import { sheetsApi } from "../../integrations/sheetsApi.js";

/**
 * Повертає клієнта з аркуша Clients за tgUserId.
 * Очікується відповідь або null.
 */
export async function getClientByTgUserId(tgUserId) {
  if (!tgUserId) return null;
  try {
    const res = await sheetsApi.clientGet({ tgUserId: String(tgUserId) });
    return res || null;
  } catch (e) {
    // не валимо флоу, якщо Sheets тимчасово недоступний
    console.error("client_get failed", e);
    return null;
  }
}

/**
 * Upsert клієнта (створити або оновити).
 */
export async function upsertClient(payload) {
  try {
    return await sheetsApi.clientUpsert(payload);
  } catch (e) {
    console.error("client_upsert failed", e);
    return null;
  }
}
