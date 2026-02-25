import { STEPS } from "../../core/fsm/steps.js";

import { renderStart } from "./start.render.js"; //+
import { renderService } from "./service.render.js"; //+
import { renderContractNo } from "./contractNo.render.js"; //!!!
import { renderVehicleGroup } from "./vehicleGroup.render.js"; //+
import { renderVehicleType } from "./vehicleType.render.js"; //+
import { renderOptions } from "./options.render.js"; //#
import { renderVehicleData } from "./vehicleData.render.js"; //+
import { renderDate } from "./date.render.js"; //+
import { renderTime } from "./time.render.js"; //+ old
import { renderPhone } from "./phone.render.js"; //+ old
import { renderConfirm } from "./confirm.render.js"; //+ jld
import { renderDone } from "./done.render.js"; //+
import { renderHome } from "./home.render.js"; //+

export async function renderStep(ctx, session) {
  switch (session.step) {
    case STEPS.START:
      return renderStart(ctx, session);

    case STEPS.HOME:
      return renderHome(ctx, session); //+

    case STEPS.SERVICE:
      return renderService(ctx, session);

    case STEPS.CONTRACT_NO:
      return renderContractNo(ctx, session);

    case STEPS.VEHICLE_GROUP:
      return renderVehicleGroup(ctx, session);

    case STEPS.VEHICLE_TYPE:
      return renderVehicleType(ctx, session);

    case STEPS.OPTIONS:
      return renderOptions(ctx, session);

    case STEPS.VEHICLE_DATA:
      return renderVehicleData(ctx, session);

    case STEPS.DATE:
      return renderDate(ctx, session);

    case STEPS.TIME:
      return renderTime(ctx, session);

    case STEPS.PHONE:
      return renderPhone(ctx, session);

    case STEPS.CONFIRM:
      return renderConfirm(ctx, session);

    case STEPS.DONE:
      return renderDone(ctx, session);

    default:
      // fallback
      session.step = STEPS.SERVICE;
      return renderService(ctx, session);
  }
}
