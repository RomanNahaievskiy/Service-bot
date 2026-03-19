import { sheetsApi } from "../../integrations/sheetsApi.js";
import { formatHumanDateFull } from "../../utils/helpers.js";

function reminderText(type, b) {
  const time = b.startsAt; // можна покращити форматуванням дати/часу, але для прикладу так зійде
  const svc = b.serviceTitle ? `\nПослуга: ${b.serviceTitle}` : ""; //
  const car = b.vehicleNumber ? `\nАвто: ${b.vehicleNumber}` : ""; //

  if (type === "T24H")
    return `⏰ Нагадування: завтра мийка  ${formatHumanDateFull(time)}.${svc}${car}`;
  if (type === "T2H")
    return `🚿 Нагадування: сьогодні мийка  ${formatHumanDateFull(time)} (через 2 год).${svc}${car}`;
  return `✅ Через 15 хв ваш час: ${formatHumanDateFull(time)}.${svc}${car}`;
}

export function startRemindersWorker(bot) {
  setInterval(async () => {
    // console.log("🔔 reminders tick", new Date().toISOString());

    // ✅ anti-overlap між інстансами
    const tick = await sheetsApi.remindersTickLock({}).catch(() => null);
    if (!tick?.locked) return;

    let due = [];
    try {
      due = await sheetsApi.remindersDue({
        nowISO: new Date().toISOString(),
        limit: 30,
      });
      // console.log("🔔 due reminders:", due?.length);
    } catch (e) {
      console.warn("⚠️ remindersDue failed:", e?.message || e);
      return;
    }

    for (const r of due) {
      try {
        const lockRes = await sheetsApi.remindersLock({
          reminderId: r.reminderId,
        });
        if (!lockRes?.locked) continue;

        const booking = r.booking;
        if (!booking) {
          await sheetsApi.remindersMark({
            reminderId: r.reminderId,
            status: "CANCELED",
            lastError: "booking not found",
          });
          continue;
        }

        const st = String(booking.status || "").toLowerCase();
        if (["canceled", "done", "no_show"].includes(st)) {
          await sheetsApi.remindersMark({
            reminderId: r.reminderId,
            status: "CANCELED",
            lastError: `booking status=${st}`,
          });
          continue;
        }
        // перевірка на простроченість нагадування
        const now = Date.now();
        const runTs = new Date(r.runAt).getTime();

        const ttlByType = {
          T15M: 20 * 60 * 1000,
          T2H: 60 * 60 * 1000,
          T24H: 6 * 60 * 60 * 1000,
        };

        const ttl = ttlByType[r.type] ?? 60 * 60 * 1000;

        if (now - runTs > ttl) {
          await sheetsApi.remindersMark({
            reminderId: r.reminderId,
            status: "CANCELED",
            lastError: "expired",
          });
          continue;
        }
        // відправка нагадування
        const text = reminderText(r.type, booking);
        await bot.telegram.sendMessage(Number(r.tgId), text);

        await sheetsApi.remindersMark({
          reminderId: r.reminderId,
          status: "SENT",
        });
      } catch (e) {
        await sheetsApi
          .remindersMark({
            reminderId: r.reminderId,
            status: "ERROR",
            attemptsInc: true,
            lastError: String(e?.message || e),
          })
          .catch(() => {});
      }
    }
  }, 60_000);
}
