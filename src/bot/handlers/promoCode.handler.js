import { STEPS } from "../../core/fsm/steps.js";
import { goToStep } from "../../core/fsm/transition.js";
import { getPriceConfig } from "../../core/services/pricing.service.js";
import { sheetsApi } from "../../integrations/sheetsApi.js";
import { getSession } from "../../utils/helpers.js";
import { renderStep } from "../render/renderStep.js";

const INVALID_PROMO_MESSAGE =
  "Промокод не знайдено або він уже недійсний. Перевірте код і спробуйте ще раз.";

export async function promoCodeHandler(ctx) {
  const chatId = ctx.chat?.id;
  const session = getSession(chatId);

  if (session.step !== STEPS.PROMO_CODE) return;

  const enteredCode = String(ctx.message?.text || "").trim();
  if (!enteredCode) {
    return ctx.reply("Будь ласка, введіть промокод текстом.");
  }

  const promo = session.data?.promo || {};

  try {
    const result = await sheetsApi.promoValidate({
      promoSessionId: promo.promoSessionId,
      linkToken: promo.linkToken,
      enteredCode,
      tgId: session.data.tgId,
      chatId: session.data.chatId,
      serviceId: session.data.serviceId || "wash",
      clientType: session.data.clientType || "retail",
    });

    if (!result?.valid) {
      session.data.promo = {
        ...promo,
        enteredCode,
        valid: false,
        validationStatus: result?.reason || "invalid",
      };

      return ctx.reply(promoReasonMessage(result?.reason));
    }

    session.data.clientType = "retail";
    session.data.contractNo = "";
    session.data.serviceId = "wash";
    session.data.serviceTitle ||= "Мийка зовнішня";
    session.data.prices = await getPriceConfig();
    session.data.promo = {
      ...promo,
      ...result.promo,
      enteredCode,
      valid: true,
      validationStatus: "valid",
      status: "validated",
    };

    goToStep(session, STEPS.VEHICLE_GROUP);
    return renderStep(ctx, session);
  } catch (e) {
    console.error("promoCodeHandler failed:", e);
    return ctx.reply(
      "Не вдалося перевірити промокод. Спробуйте ще раз трохи пізніше.",
    );
  }
}

function promoReasonMessage(reason) {
  switch (reason) {
    case "not_started":
      return "Ця акційна пропозиція ще не активна.";
    case "expired":
      return "Термін дії цього промокоду вже завершився.";
    case "exhausted":
      return "Ліміт використань цього промокоду вже вичерпано.";
    case "not_applicable_service":
    case "not_applicable_client_type":
      return "Цей промокод не застосовується до обраної послуги.";
    default:
      return INVALID_PROMO_MESSAGE;
  }
}
