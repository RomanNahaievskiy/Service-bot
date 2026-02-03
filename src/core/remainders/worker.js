import { sheetsApi } from "../../integrations/sheetsApi.js";

function reminderText(type, b) {
  const time = b.startsAt;
  const svc = b.serviceTitle ? `\nПослуга: ${b.serviceTitle}` : "";
  const car = b.vehicleNumber ? `\nАвто: ${b.vehicleNumber}` : "";

  if (type === "T24H")
    return `⏰ Нагадування: завтра мийка о ${time}.${svc}${car}`;
  if (type === "T2H")
    return `🚿 Нагадування: сьогодні мийка о ${time} (через 2 год).${svc}${car}`;
  return `✅ Через 15 хв ваш час: ${time}.${svc}${car}`;
}

export function startRemindersWorker(bot) {
  setInterval(async () => {
    console.log("🔔 reminders tick", new Date().toISOString());

    let due = [];
    try {
      due = await sheetsApi.remindersDue({
        nowISO: new Date().toISOString(),
        limit: 30,
      });
      console.log("🔔 due reminders:", due?.length);
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
