// const BOOKINGS = [];

// export function createBooking(data) {
//   const booking = {
//     id: Date.now(),
//     ...data,
//     createdAt: new Date(),
//   };

//   BOOKINGS.push(booking);
//   return booking;
// }

import { sheetsApi } from "../../integrations/sheetsApi.js";

export async function createBooking(data) {
  // data: { chatId, service, vehicle, vehicleNumber, date, time, fullName?, phone? }

  // ⬇️ адаптуй під свої формати:
  // date: "2025-12-24" або спеціальний код типу DATE_TOMORROW
  // time: "15:45"
  // тут я припущу, що session.data.date вже у форматі YYYY-MM-DD
  const startsAt = `${data.date}T${data.time}:00+02:00`;

  // end time (приклад: 30 хв)
  const endsAt = addMinutesISO(startsAt, 30);

  return await sheetsApi.createBooking({
    tgId: String(data.chatId),
    fullName: data.fullName || "—",
    phone: data.phone || "",
    service: String(data.service), // можна потім мапнути на людську назву
    startsAt,
    endsAt,
    vehicle: `${data.vehicle || ""} ${data.vehicleNumber || ""}`.trim(),
    comment: "",
  });
}

function addMinutesISO(iso, minutes) {
  const d = new Date(iso);
  d.setMinutes(d.getMinutes() + minutes);
  // повернемо ISO без Z, але з часовим поясом краще тримати як +02:00 вхідний;
  // для простоти — повернемо Z (GAS нормально прийме)
  return d.toISOString();
}

//Пізніше:

// замінимо на БД

// додамо перевірку конфліктів

// підключимо нагадування
