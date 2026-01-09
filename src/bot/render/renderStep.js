import { STEPS } from "../../core/fsm/steps.js";
import { renderService } from "./service.render.js";
import { renderVehicleGroup } from "./vehicleGroup.render.js";
// Універсальний рендерер кроків FSM
export async function renderStep(ctx, session) {
  switch (session.step) {
    // Додайте інші кроки за потреби
    case STEPS.SERVICE:
      return renderService(ctx, session);

    case STEPS.VEHICLE_GROUP:
      return renderVehicleGroup(ctx, session);

    default:
      return ctx.reply("⚠️ Невідомий стан");
  }
}
