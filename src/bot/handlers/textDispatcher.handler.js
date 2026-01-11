import { getSession } from "../../utils/helpers.js";
import { STEPS } from "../../core/fsm/steps.js";
import { vehicleDataHandler } from "./vehicleData.handler.js";
import { phoneTextHandler } from "./phoneText.handler.js";

export async function textDispatcher(ctx) {
  const chatId = ctx.chat?.id;
  const session = getSession(chatId);

  switch (session.step) {
    case STEPS.VEHICLE_DATA:
      return vehicleDataHandler(ctx);

    case STEPS.PHONE:
      return phoneTextHandler(ctx);

    default:
      // ігноруємо будь-який інший текст (щоб не ламав FSM)
      return;
  }
}
