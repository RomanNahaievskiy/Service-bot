import { STEPS } from "../../core/fsm/steps.js";
import { goToStep } from "../../core/fsm/transition.js";
import { renderStep } from "../render/renderStep.js";
import { getSession } from "../../utils/helpers.js";
import { sheetsApi } from "../../integrations/sheetsApi.js";

export async function contractNoHandler(ctx) {
  console.log("<СontractNo handler>"); // test debug
  const chatId =
    ctx.chat?.id ??
    ctx.callbackQuery?.message?.chat?.id ??
    ctx.update?.callback_query?.message?.chat?.id;
  const session = getSession(chatId);
  if (session.step !== STEPS.CONTRACT_NO) return;

  const contractNo = String(ctx.message?.text ?? "").trim(); // отримуємо номер договору від користувача
  if (!contractNo) return;

  //   session.data.clientType = "contract"; // необов'язково, вже встановлено раніше
  session.data.contractNo = contractNo;

  const vehicles = await sheetsApi.contractVehiclesGet({ contractNo }); // отримуємо ТЗ за номером договору

  if (!vehicles.length) {
    session.data.contractNoError = "Договір не знайдено або немає активних ТЗ.";
    // лишаємось на CONTRACT_NO
    return renderStep(ctx, session); // вже там має рендеритися набір кнопок із номерами транспортних засобів за договором  із session.data.contractVehicles
  }

  session.data.contractVehicles = vehicles;
  session.data.contractNoError = null;

  goToStep(session, STEPS.VEHICLE_DATA);
  return renderStep(ctx, session);
}
