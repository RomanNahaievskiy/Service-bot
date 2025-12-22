import "dotenv/config";

export const ENV = {
  BOT_TOKEN: process.env.BOT_TOKEN,
  NODE_ENV: process.env.NODE_ENV || "development",
};

if (!ENV.BOT_TOKEN) {
  throw new Error("BOT_TOKEN is not defined");
}
