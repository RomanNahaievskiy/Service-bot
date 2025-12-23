import { env } from "../config/env.js";

async function callSheets(action, payload = {}) {
  if (!env.SHEETS_API_URL) throw new Error("SHEETS_API_URL is missing");
  if (!env.SHEETS_API_TOKEN) throw new Error("SHEETS_API_TOKEN is missing");

  const res = await fetch(env.SHEETS_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      token: env.SHEETS_API_TOKEN,
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

export const sheetsApi = {
  createBooking: (payload) => callSheets("create", payload),
  updateStatus: (id, status, admin = "") =>
    callSheets("update_status", { id, status, admin }),
  cancel: (id) => callSheets("cancel", { id }),
};
