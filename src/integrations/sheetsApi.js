import { env } from "../config/env.js";

export async function sheetsCreateBooking(payload) {
  const res = await fetch(env.SHEETS_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.SHEETS_API_TOKEN}`,
    },
    body: JSON.stringify({ action: "create", payload }),
  });

  const data = await res.json();
  if (!data.ok) throw new Error(data.error || "Sheets API error");
  return data.data;
}

export async function sheetsListBookings({ tgId, status } = {}) {
  const url = new URL(env.SHEETS_API_URL);
  url.searchParams.set("action", "list");
  if (tgId) url.searchParams.set("tgId", String(tgId));
  if (status) url.searchParams.set("status", String(status));

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${env.SHEETS_API_TOKEN}` },
  });

  const data = await res.json();
  if (!data.ok) throw new Error(data.error || "Sheets API error");
  return data.data;
}
