// Cancel all reminders associated with a booking

await sheetsApi.remindersCancelByBooking({ bookingId: id });
