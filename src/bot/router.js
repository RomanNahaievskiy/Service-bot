import { startHandler } from "./handlers/start.handler.js";
import { serviceHandler } from "./handlers/service.handler.js";
import { vehicleTypeHandler } from "./handlers/vehicle.handler.js";
import { vehicleDataHandler } from "./handlers/vehicleData.handler.js";
import { dateHandler } from "./handlers/date.handlers.js";
import { timeHandler } from "./handlers/time.handler.js";
import { timeSelectHandler } from "./handlers/timeSelect.handler.js";
import { askPhoneHandler } from "./handlers/askPhone.handler.js";
import { phoneHandler } from "./handlers/phone.handler.js";
import { confirmHandler } from "./handlers/confirm.handler.js";
import { startOverHandler } from "./handlers/startOver.handler.js";
import { backToServiceHandler } from "./handlers/backToService.handler.js";
import { backToVehicleTypeHandler } from "./handlers/backToVehicleType.handler.js";
import { backToVehicleDataHandler } from "./handlers/backToVehicleData.handler.js";
import { backToDateHandler } from "./handlers/backToDate.handler.js";
import { backToTimeHandler } from "./handlers/backToTime.handler.js";

export function registerRoutes(bot) {
  console.log("🧭 Router registered"); //test

  bot.start(startHandler);

  bot.action(/^SERVICE_/, serviceHandler); //Вибір послуги
  bot.action(/^VEHICLE_/, vehicleTypeHandler); //Вибір типу ТЗ
  bot.action(/^DATE_/, dateHandler); //Вибір дати

  bot.action("TIME_SELECT", timeHandler); //Вибір часу
  bot.action(/^TIME_/, timeSelectHandler); //Підтвердження вибору часу

  bot.action("CONFIRM", confirmHandler); //Підтвердження запису

  // BACK + RESET
  bot.action("START_OVER", startOverHandler);
  bot.action("BACK_TO_SERVICE", backToServiceHandler);
  bot.action("BACK_TO_VEHICLE_TYPE", backToVehicleTypeHandler);
  bot.action("BACK_TO_VEHICLE_DATA", backToVehicleDataHandler);
  bot.action("BACK_TO_DATE", backToDateHandler);
  bot.action("BACK_TO_TIME", backToTimeHandler);

  // обробка текстових повідомлень (завжди вкінці) для введення даних ТЗ
  bot.on("text", vehicleDataHandler); //Обробка текстових повідомлень
  bot.on("contact", phoneHandler); //Обробка контактів (номер телефону)
}

// DIAGNOSTICS:
// import { startHandler } from "./handlers/start.handler.js";
// import { serviceHandler } from "./handlers/service.handler.js";

// export function registerRoutes(bot) {
//   console.log("🧭 Router registered");

//   bot.start(startHandler);

//   bot.on("callback_query", (ctx) => {
//     console.log("📩 callback received:", ctx.callbackQuery.data);
//   });

//   bot.action(/^SERVICE_/, serviceHandler);
// }
