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
  return await sheetsApi.createBooking(data);
}

//Пізніше:

// замінимо на БД

// додамо перевірку конфліктів

// підключимо нагадування
