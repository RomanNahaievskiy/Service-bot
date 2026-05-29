import { STEPS } from "../../core/fsm/steps.js";
import { setStep } from "../../core/fsm/transition.js";
import { getSession, resetSession } from "../../utils/helpers.js";
import { renderStep } from "../render/renderStep.js";
import { getClientByTgUserId } from "../../core/domain/clients.js";
import { sheetsApi } from "../../integrations/sheetsApi.js";

const PROMO_PAYLOAD_PREFIX = "promo_";
const PROMO_START_MESSAGE =
  "Вітаємо! Щоб скористатися акційною пропозицією на мийку вашого транспорту, напишіть Ваш промокод.";

export async function startHandler(ctx) {
  resetSession(ctx.chat.id);
  const session = getSession(ctx.chat.id);

  // ✅ Підтягуємо клієнта з Google Sheets (Clients)
  const tgUserId = ctx.from?.id;

  const client = await getClientByTgUserId(tgUserId);
  if (client) {
    session.data.client = client;
    // префіл, щоб не просити контакт щоразу
    if (client.phone) session.data.phone = String(client.phone);
    if (client.fullName) session.data.fullName = String(client.fullName);
  }

  // базова ідентифікація (одразу)
  session.data.tgId = String(ctx.from?.id || "");
  session.data.chatId = String(ctx.chat?.id || "");

  // службове (одразу)
  const now = new Date().toISOString();
  session.data.id ??= crypto.randomUUID(); // потрібно: import crypto from "crypto";
  session.data.createdAt ??= now;
  session.data.updatedAt ??= now;

  // дефолти, щоб схема завжди була повна
  session.data.clientType ??= "retail";
  session.data.contractNo ??= "";
  session.data.optionIds ??= [];
  session.data.comment ??= "";
  session.data.status ??= "new";
  session.data.admin ??= "";

  const startPayload = getStartPayload(ctx);
  if (startPayload?.startsWith(PROMO_PAYLOAD_PREFIX)) {
    const linkToken = startPayload.slice(PROMO_PAYLOAD_PREFIX.length);
    const promoSessionId = `ps_${crypto.randomUUID()}`;
    const fullName =
      session.data.fullName ||
      [ctx.from?.first_name, ctx.from?.last_name].filter(Boolean).join(" ");

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

    await trackPromoSessionOpen(ctx, session, {
      promoSessionId,
      linkToken,
      fullName,
    });

    setStep(session, STEPS.PROMO_CODE);
    session.history = [];

    return ctx.reply(PROMO_START_MESSAGE);
  }

  console.log("START: client from sheets =", client); // test debug
  console.log("START: session.data.phone =", session.data.phone); // test debug
  setStep(session, STEPS.HOME);
  session.history = [];

  return renderStep(ctx, session);
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
