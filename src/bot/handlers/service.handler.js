import { STEPS } from "../../core/fsm/steps.js";
import { getSession } from "../../utils/helpers.js";
import { getServiceByCallback } from "../../core/domain/services.js";
import { goToStep } from "../../core/fsm/transition.js";
import { renderStep } from "../render/renderStep.js";

import { getPriceConfig } from "../../core/services/pricing.service.js";
import { sheetsApi } from "../../integrations/sheetsApi.js";

// Обробник вибору послуги
export async function serviceHandler(ctx) {
  console.log("🔥 serviceHandler", ctx.callbackQuery.data);

  const session = getSession(ctx.chat.id);
  const callbackData = ctx.callbackQuery.data; // те що обрав користувач

  // FSM guard (опційно, але бажано)
  if (session.step !== STEPS.SERVICE) {
    return ctx.answerCbQuery();
  }

  const service = getServiceByCallback(callbackData);

  if (!service) {
    return ctx.answerCbQuery("❌ Невідома послуга");
  }

  // 1️⃣ зберігаємо дані
  session.data.serviceId = service.id;
  session.data.serviceTitle = service.title;

  // ✅ підвантажуємо прайс з Google Sheets один раз (кеш уже є в pricing.service)
  //TODO: виправити  отримання прайсу з гугла  відповідо до типу клієнта контракт / рітейл
  /*зараз цни приходять із 10хвилинного кешу , куди потрапляють із pricing.service.js -> pricesGet() , 
  який отримує їх із гугла і кешує на 10хвилин, щоб не тягти гугл кожного разу/
  але це працює без умови на тип клієнта, тому якщо колись додаси різні ціни для контракту та рітейлу, 
  то треба буде тут дописати логіку, щоб підвантажувати правильний прайс відповідно до вибору користувача


  
  */
  try {
    session.data.prices = await getPriceConfig(); // { vehicles, options } (може +services, якщо колись додаси)
  } catch (e) {
    console.error("❌ prices_get failed:", e);
    await ctx.answerCbQuery("❌ Не вдалося завантажити прайс", {
      show_alert: true,
    });
    // можна або залишити на SERVICE, або показати повідомлення і STOP
    return;
  }
  // 2️⃣ змінюємо стан з допомогою transition
  // спеціальна логіка для типу клієнта
  // if (service.id === "wash_contract") {
  //   //session.data.prices = []; // очищаємо прайс чи краще оновити? , бо для контракту будуть другі ціни
  //   // session.data.prices = await sheetsApi.contractPricingGet(); // оновлюємо прайс для контракту (якщо він відрізняється від рітейлу)
  //   session.data.clientType = "contract";
  //   goToStep(session, STEPS.CONTRACT_NO);
  // } else {
  //   session.data.clientType = "retail";
  //   session.data.contractNo = ""; // явно вказуємо порожній рядок, щоб не було undefined
  //   goToStep(session, STEPS.VEHICLE_GROUP);
  // }

  if (service.id === "wash_contract") {
    session.data.clientType = "contract";

    // очищаємо контрактний контекст перед новим пошуком
    session.data.contractNo = "";
    session.data.contractNoError = null;
    session.data.contractVehicleError = null;
    session.data.contractVehicles = [];
    session.data.contractVehicle = null;

    session.data.vehicleId = null;
    session.data.vehicleGroup = null;
    session.data.vehicleType = null;
    session.data.vehicleNumber = null;
    session.data.vehicleTitle = null;
    session.data.vehicleAlias = null;

    goToStep(session, STEPS.CONTRACT_VEHICLE);
  } else {
    session.data.clientType = "retail";
    session.data.contractNo = "";
    goToStep(session, STEPS.VEHICLE_GROUP);
  }
  await ctx.answerCbQuery();

  // 3️⃣ універсальний рендер
  return renderStep(ctx, session);
}
