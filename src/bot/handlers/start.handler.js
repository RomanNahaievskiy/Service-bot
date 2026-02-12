import { STEPS } from "../../core/fsm/steps.js";
import { setStep } from "../../core/fsm/transition.js";
import { getSession, resetSession } from "../../utils/helpers.js";
import { renderStep } from "../render/renderStep.js";
import { getClientByTgUserId } from "../../core/domain/clients.js";

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

  console.log("START: client from sheets =", client); // test debug
  console.log("START: session.data.phone =", session.data.phone); // test debug
  setStep(session, STEPS.HOME);
  session.history = [];

  return renderStep(ctx, session);
}
