import "dotenv/config";

export const ENV = {
  BOT_TOKEN: process.env.BOT_TOKEN,
  NODE_ENV: process.env.NODE_ENV || "development",
  SHEETS_API_URL: process.env.SHEETS_API_URL,
  SHEETS_API_TOKEN: process.env.SHEETS_API_TOKEN,
};

if (!ENV.BOT_TOKEN) {
  throw new Error("BOT_TOKEN is not defined");
}

if (!ENV.SHEETS_API_TOKEN) {
  throw new Error("SHEETS_API_TOKEN is not defined");
}
