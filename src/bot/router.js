import { startHandler } from "./handlers/start.handler.js"; //+
import { serviceHandler } from "./handlers/service.handler.js"; //+

import { contractVehicleSelectHandler } from "./handlers/contractVehicleSelect.handler.js"; //!!

import { vehicleGroupHandler } from "./handlers/vehicleGroup.handler.js"; //+
import { vehicleTypeHandler } from "./handlers/vehicleType.handler.js"; //+

import { optionsToggleHandler } from "./handlers/optionsToggle.handler.js"; // #
import { optionsDoneHandler } from "./handlers/optionsDone.handler.js"; // # десь загубив

import { datePickHandler } from "./handlers/date.handlers.js"; //+

import { timePagePrevHandler } from "./handlers/timePagePrev.handler.js";
import { timePageNextHandler } from "./handlers/timePageNext.handler.js";

import { timeHandler } from "./handlers/time.handler.js"; //+
import { timeSelectHandler } from "./handlers/timeSelect.handler.js"; //+

import { phoneHandler } from "./handlers/phone.handler.js"; //+
import { textDispatcher } from "./handlers/textDispatcher.handler.js"; //  для обробки текстових повдомлень
import { confirmHandler } from "./handlers/confirm.handler.js"; //+

import { useSavedPhoneHandler } from "./handlers/useSavedPhone.handler.js";
import { changePhoneHandler } from "./handlers/changePhone.handler.js";

import { startOverHandler } from "./handlers/startOver.handler.js"; //+
import { backHandler } from "./handlers/back.handler.js"; //+

export function registerRoutes(bot) {
  console.log("🧭 Router registered");

  // START
  bot.start(startHandler);
  bot.action("START_FLOW", startHandler); // 🔥 те саме

  // FORWARD FLOW
  bot.action(/^SERVICE_/, serviceHandler); // SERVICE_WASH, SERVICE_REPAIR...

  bot.action(/^CVN_/, contractVehicleSelectHandler); //залишити  поки

  bot.action(/^GROUP_/, vehicleGroupHandler); // GROUP_PASSENGER / GROUP_CARGO / GROUP_TANKER / GROUP_OTHER
  bot.action(/^VEH_/, vehicleTypeHandler); // VEH_micro_18, VEH_bus_30...

  bot.action(/^OPT_TOGGLE_/, optionsToggleHandler); // OPT_TOGGLE_engine_small
  bot.action("OPT_DONE", optionsDoneHandler); // finish options

  // bot.action(/^DATE_/, dateHandler); // DATE_TODAY / DATE_TOMORROW
  bot.action(/^DATE_\d{4}-\d{2}-\d{2}$/, datePickHandler); // DATE_2026-01-11

  bot.action("TIME_SELECT", timeHandler); // show slots
  // pagination
  bot.action("TPPREV", timePagePrevHandler);
  bot.action("TPNEXT", timePageNextHandler);
  bot.action("TPINFO", (ctx) => ctx.answerCbQuery()); // просто заглушка

  bot.action(/^TIME_/, timeSelectHandler); // TIME_19:00

  bot.on("contact", phoneHandler); // phone контакт (guard по STEPS.PHONE)

  bot.on("text", textDispatcher); // vehicle number/description (guard по STEPS.VEHICLE_DATA)

  bot.action("USE_SAVED_PHONE", useSavedPhoneHandler);
  bot.action("CHANGE_PHONE", changePhoneHandler);

  bot.action("CONFIRM", confirmHandler); // confirm booking

  // NAV
  bot.action("BACK", backHandler); // ✅ універсальний назад
  bot.action("START_OVER", startOverHandler); // reset
  //
  bot.hears("Записатися на мийку", startOverHandler); // клавіатура новий запис
}
