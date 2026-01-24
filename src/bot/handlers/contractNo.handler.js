import { STEPS } from "../../core/fsm/steps.js";
import { goToStep } from "../../core/fsm/transition.js";
import { renderStep } from "../render/renderStep.js";

export async function ContractNoHandler(ctx) {
  console.log("<СontractNo handler>"); // test debug
  const chatId = ctx.chat?.id;
  const session = getSession(chatId);
  if (session.step !== STEPS.CONTRACT_NO) return;

  const contractNo = ctx.message.text.trim();
  // Тут можна додати валідацію номеру договору, якщо потрібно
  session.data.contractNo = contractNo;
  // Переходимо до наступного кроку, наприклад, VEHICLE_DATA
  goToStep(session, STEPS.VEHICLE_DATA);
  return renderStep(ctx, session);
}
