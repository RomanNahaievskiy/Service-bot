import { ENV } from "../config/env.js";

async function callSheets(action, payload = {}) {
  if (!ENV.SHEETS_API_URL) throw new Error("SHEETS_API_URL is missing");
  if (!ENV.SHEETS_API_TOKEN) throw new Error("SHEETS_API_TOKEN is missing");
  const res = await fetch(ENV.SHEETS_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      token: ENV.SHEETS_API_TOKEN,
      action,
      payload,
    }),
  });

  const text = await res.text();

  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error("Sheets API returned non-JSON: " + text.slice(0, 200));
  }

  if (!data.ok) throw new Error(data.error || "Sheets API error");
  return data.data;
}

async function callSheetsGet(action, params = {}) {
  if (!ENV.SHEETS_API_URL) throw new Error("SHEETS_API_URL is missing");
  if (!ENV.SHEETS_API_TOKEN) throw new Error("SHEETS_API_TOKEN is missing");

  const url = new URL(ENV.SHEETS_API_URL);
  url.searchParams.set("action", action);
  url.searchParams.set("token", ENV.SHEETS_API_TOKEN);
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
  }

  const res = await fetch(url.toString(), { method: "GET" });

  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error("Sheets API returned non-JSON: " + text.slice(0, 200));
  }

  if (!data.ok) throw new Error(data.error || "Sheets API error");
  return data.data;
}

export const sheetsApi = {
  // call via POST
  // створити бронювання
  createBooking: (payload) => callSheets("create", payload),
  // оновити статус бронювання
  updateStatus: (id, status, admin = "") =>
    callSheets("update_status", { id, status, admin }),
  // скасувати бронювання
  cancel: (id) => callSheets("cancel", { id }),
  // отримати список бронювань за датою та статусом
  listBookings: ({ dateISO, status } = {}) =>
    callSheets("list", { dateISO, status }),
  // get prices via GET
  pricesGet: () => callSheetsGet("prices_get"),
  //========================================================================================================================================================
  // ===== Clients =====
  // Отримати клієнта за Telegram user id
  clientGet: ({ tgUserId }) =>
    callSheetsGet("client_get", { tgUserId: String(tgUserId) }),

  // Upsert клієнта (створити або оновити)
  clientUpsert: (payload) => callSheets("client_upsert", payload),

  // ===== Contract =====
  // Отримати список транспортних засобів за номером договору
  contractVehiclesGet: ({ contractNo }) =>
    callSheetsGet("contract_vehicles_get", { contractNo: String(contractNo) }),
};
