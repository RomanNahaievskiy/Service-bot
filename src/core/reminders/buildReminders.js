import crypto from "crypto";

export function buildRemindersForBooking(booking) {
  const startsAt = new Date(booking.startsAt);
  if (Number.isNaN(startsAt.getTime())) return [];

  const now = Date.now();

  const defs = [
    { type: "T24H", msBefore: 24 * 60 * 60 * 1000 },
    { type: "T2H", msBefore: 2 * 60 * 60 * 1000 },
    { type: "T15M", msBefore: 15 * 60 * 1000 },
  ];

  return defs
    .map((d) => ({
      type: d.type,
      runAt: new Date(startsAt.getTime() - d.msBefore),
    }))
    .filter((x) => x.runAt.getTime() > now + 30_000) // не створюємо в минулому
    .map((x) => ({
      reminderId: crypto.randomUUID(),
      bookingId: String(booking.id),
      tgId: String(booking.tgId),
      type: x.type,
      runAt: x.runAt.toISOString(),
      status: "PENDING",
      attempts: 0,
      lastError: "",
      createdAt: new Date().toISOString(),
      sentAt: "",
    }));
}
