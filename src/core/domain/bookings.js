const BOOKINGS = [];

export function createBooking(data) {
  const booking = {
    id: Date.now(),
    ...data,
    createdAt: new Date(),
  };

  BOOKINGS.push(booking);
  return booking;
}

//Пізніше:

// замінимо на БД

// додамо перевірку конфліктів

// підключимо нагадування
