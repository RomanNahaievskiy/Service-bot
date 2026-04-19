import { getSession } from "../../utils/helpers.js";
import { STEPS } from "../../core/fsm/steps.js";
import { vehicleDataHandler } from "./vehicleData.handler.js";
import { phoneTextHandler } from "./phoneText.handler.js";
// import { contractNoHandler } from "./contractNo.handler.js";
// import { contractVehicleHandler } from "./contractVehicle.handler.js";

// export async function textDispatcher(ctx, next) {
//   const chatId = ctx.chat?.id;
//   const session = getSession(chatId);

//   switch (session.step) {
//     case STEPS.CONTRACT_NO:
//       return contractNoHandler(ctx);

//     case STEPS.CONTRACT_VEHICLE:
//       return contractVehicleHandler(ctx);

//     case STEPS.VEHICLE_DATA:
//       return vehicleDataHandler(ctx);

//     case STEPS.PHONE:
//       return phoneTextHandler(ctx);

//     default:
//       // ✅ НЕ ігноруємо “назавжди”, а віддаємо іншим слухачам (hears)
//       return next();
//   }
// }

import { contractVehicleHandler } from "./contractVehicle.handler.js";

export async function textDispatcher(ctx, next) {
  const chatId = ctx.chat?.id;
  const session = getSession(chatId);

  switch (session.step) {
    case STEPS.CONTRACT_VEHICLE:
      return contractVehicleHandler(ctx);

    case STEPS.VEHICLE_DATA:
      return vehicleDataHandler(ctx);

    case STEPS.PHONE:
      return phoneTextHandler(ctx);

    default:
      return next();
  }
}
