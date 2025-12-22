export function resolveDateByCallback(callback) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  switch (callback) {
    case "DATE_TODAY":
      return today;

    case "DATE_TOMORROW": {
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      return tomorrow;
    }

    default:
      return null;
  }
}

export function formatDate(date) {
  return date.toLocaleDateString("uk-UA", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

//Легко розширити (календар, тиждень)
