import { getClientByTgUserId } from "../../core/domain/clients.js";
import { STEPS } from "../../core/fsm/steps.js";
import { setStep } from "../../core/fsm/transition.js";
import { sheetsApi } from "../../integrations/sheetsApi.js";
import { getSession, resetSession } from "../../utils/helpers.js";
import { renderStep } from "../render/renderStep.js";

const PROMO_PAYLOAD_PREFIX = "promo_";
const PROMO_START_MESSAGE =
  "Вітаємо! Щоб скористатися акційною пропозицією на мийку вашого транспорту, напишіть Ваш промокод.";

export async function startHandler(ctx) {
  resetSession(ctx.chat.id);
  const session = getSession(ctx.chat.id);
  const startPayload = getStartPayload(ctx);

  initBaseSessionData(ctx, session);

  if (startPayload?.startsWith(PROMO_PAYLOAD_PREFIX)) {
    const linkToken = startPayload.slice(PROMO_PAYLOAD_PREFIX.length);
    const promoSessionId = `ps_${crypto.randomUUID()}`;
    const fullName = [ctx.from?.first_name, ctx.from?.last_name]
      .filter(Boolean)
      .join(" ");

    session.data.clientType = "retail";
    session.data.contractNo = "";
    session.data.serviceId = "wash";
    session.data.serviceTitle = "Мийка зовнішня";
    session.data.promo = {
      promoSessionId,
      linkToken,
      status: "opened",
      validationStatus: "pending",
    };

    setStep(session, STEPS.PROMO_CODE);
    session.history = [];

    void trackPromoSessionOpen(ctx, session, {
      promoSessionId,
      linkToken,
      fullName,
    });

    return ctx.reply(PROMO_START_MESSAGE);
  }

  const tgUserId = ctx.from?.id;
  const client = await getClientByTgUserId(tgUserId);
  if (client) {
    session.data.client = client;
    if (client.phone) session.data.phone = String(client.phone);
    if (client.fullName) session.data.fullName = String(client.fullName);
  }

  console.log("START: client from sheets =", client);
  console.log("START: session.data.phone =", session.data.phone);
  setStep(session, STEPS.HOME);
  session.history = [];

  return renderStep(ctx, session);
}

function initBaseSessionData(ctx, session) {
  session.data.tgId = String(ctx.from?.id || "");
  session.data.chatId = String(ctx.chat?.id || "");

  const now = new Date().toISOString();
  session.data.id ??= crypto.randomUUID();
  session.data.createdAt ??= now;
  session.data.updatedAt ??= now;

  session.data.clientType ??= "retail";
  session.data.contractNo ??= "";
  session.data.optionIds ??= [];
  session.data.comment ??= "";
  session.data.status ??= "new";
  session.data.admin ??= "";
}

function getStartPayload(ctx) {
  if (ctx.startPayload) return String(ctx.startPayload).trim();

  const text = ctx.message?.text || "";
  const match = String(text).match(/^\/start(?:@\w+)?\s+(.+)$/);
  return match ? match[1].trim() : "";
}

async function trackPromoSessionOpen(ctx, session, promo) {
  try {
    await sheetsApi.promoSessionUpsert({
      promoSessionId: promo.promoSessionId,
      linkToken: promo.linkToken,
      tgId: session.data.tgId,
      chatId: session.data.chatId,
      username: ctx.from?.username || "",
      fullName: promo.fullName || "",
      phone: session.data.phone || "",
      lastStep: STEPS.PROMO_CODE,
      status: "opened",
    });
  } catch (e) {
    console.warn("promo_session_upsert failed:", e?.message || e);
  }
}
