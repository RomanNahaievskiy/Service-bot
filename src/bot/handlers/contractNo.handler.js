// import { STEPS } from "../../core/fsm/steps.js";
// import { goToStep } from "../../core/fsm/transition.js";
// import { renderStep } from "../render/renderStep.js";
// import { getSession } from "../../utils/helpers.js";
// import { sheetsApi } from "../../integrations/sheetsApi.js";

// export async function contractNoHandler(ctx) {
//   console.log("<СontractNo handler>"); // test debug
//   const chatId =
//     ctx.chat?.id ??
//     ctx.callbackQuery?.message?.chat?.id ??
//     ctx.update?.callback_query?.message?.chat?.id;
//   const session = getSession(chatId);
//   if (session.step !== STEPS.CONTRACT_NO) return;

//   const contractNo = String(ctx.message?.text ?? "").trim(); // отримуємо номер договору від користувача
//   if (!contractNo) return;

//   //   session.data.clientType = "contract"; // необов'язково, вже встановлено раніше
//   session.data.contractNo = contractNo;
//   //! session.data.prices = await sheetsApi.contractPricingGet({ contractNo, vehicleId, serviceId, optionIds })
//   const vehicles = await sheetsApi.contractVehiclesGet({ contractNo }); // отримуємо ТЗ за номером договору

//   if (!vehicles.length) {
//     session.data.contractNoError = `Договір ${contractNo} не знайдено.`; // (або немає активних транспортних засобів) помилка для рендера
//     // лишаємось на CONTRACT_NO
//     return renderStep(ctx, session); // вже там має рендеритися набір кнопок із номерами транспортних засобів за договором  із session.data.contractVehicles
//   }

//   session.data.contractVehicles = vehicles;
//   session.data.contractNoError = null;

//   goToStep(session, STEPS.VEHICLE_DATA);
//   return renderStep(ctx, session);
// }

import { STEPS } from "../../core/fsm/steps.js";
import { goToStep } from "../../core/fsm/transition.js";
import { renderStep } from "../render/renderStep.js";
import { getSession } from "../../utils/helpers.js";
import { sheetsApi } from "../../integrations/sheetsApi.js";

export async function contractNoHandler(ctx) {
  console.log("<ContractNo handler>");

  const chatId =
    ctx.chat?.id ??
    ctx.callbackQuery?.message?.chat?.id ??
    ctx.update?.callback_query?.message?.chat?.id;

  const session = getSession(chatId);
  if (session.step !== STEPS.CONTRACT_NO) return;

  const contractNo = String(ctx.message?.text ?? "").trim();
  if (!contractNo) return;

  session.data.contractNo = contractNo;

  try {
    const vehicles = await sheetsApi.contractVehiclesGet({ contractNo });

    if (!vehicles.length) {
      session.data.contractNoError = `Договір ${contractNo} не знайдено.`;
      return renderStep(ctx, session);
    }

    session.data.contractNoError = null;
    session.data.contractVehicleError = null;
    session.data.contractVehicles = vehicles;

    session.data.vehicleId = null;
    session.data.vehicleGroup = null;
    session.data.vehicleType = null;
    session.data.vehicleNumber = null;
    session.data.vehicleTitle = null;
    session.data.contractVehicle = null;

    goToStep(session, STEPS.CONTRACT_VEHICLE);
    return renderStep(ctx, session);
  } catch (e) {
    console.error("contractNoHandler error:", e);
    session.data.contractNoError =
      "Не вдалося перевірити номер договору. Спробуйте ще раз.";
    return renderStep(ctx, session);
  }
}
