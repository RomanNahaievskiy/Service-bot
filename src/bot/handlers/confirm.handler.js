//========================================================================================================================================================
import { STEPS } from "../../core/fsm/steps.js";
import { getSession } from "../../utils/helpers.js";
import { createBooking } from "../../core/domain/bookings.js";
import { goToStep, setStep } from "../../core/fsm/transition.js";
import { renderStep } from "../render/renderStep.js";
import { sheetsApi } from "../../integrations/sheetsApi.js";
import { buildRemindersForBooking } from "../../core/reminders/buildReminders.js";

export async function confirmHandler(ctx) {
  console.log("✅ confirmHandler");

  const chatId =
    ctx.chat?.id ??
    ctx.callbackQuery?.message?.chat?.id ??
    ctx.update?.callback_query?.message?.chat?.id;

  const session = getSession(chatId);

  if (session.step !== STEPS.CONFIRM) return ctx.answerCbQuery();

  session.data.tgId ??= String(ctx.from?.id || "");
  session.data.chatId ??= String(chatId);

  try {
    const promoOk = await validatePromoBeforeBooking(session);
    if (!promoOk.ok) {
      session.data.confirmError = promoConfirmErrorMessage(promoOk.reason);
      await ctx.answerCbQuery(session.data.confirmError, { show_alert: true });
      return renderStep(ctx, session);
    }

    console.log("CONFIRM: creating booking", {
      chatId,
      tgId: session.data.tgId,
      date: session.data.date,
      time: session.data.time,
    });
    const booking = await createBooking(session.data); // throws e
    console.log("CONFIRM: booking created", booking?.id);
    await consumePromoForBooking(session, booking);

    // ✅ Запланувати нагадування
    try {
      console.log("⏰ scheduling reminders for booking", booking.id);
      const rows = buildRemindersForBooking(booking);
      if (rows.length) {
        await sheetsApi.remindersAppend(rows);
      }
    } catch (e) {
      // нагадування не повинні ламати бронювання
      console.warn("⚠️ remindersAppend failed:", e?.message || e);
    }

    session.data.booking = booking;
    session.data.confirmError = null;
    // ✅ 1) Прибираємо (редагуємо) екран CONFIRM, щоб він не висів
    // Це працює тільки для callback, де є message_id
    // if (ctx.callbackQuery?.message) {
    //   await ctx.editMessageText("✅ Дякуємо!");
    // }

    // ✅ 2) Переходимо на DONE і рендеримо чек окремим повідомленням
    goToStep(session, STEPS.DONE);

    await ctx.answerCbQuery("✅ Запис створено");
    return renderStep(ctx, session);
  } catch (err) {
    console.error("❌ createBooking failed", err);
    console.error("CONFIRM: createBooking failed", err?.message, err.code);

    session.data.confirmError = String(err?.message || err);

    // Перевірка колізії (new/approved)
    // const conflict = findConflict_(String(p.startsAt), String(p.endsAt));
    // if (conflict) {
    //   const e = new Error(`Time slot conflict with booking id=${conflict.id}`);
    //   e.code="SLOT_CONFLICT";
    //   e.bookingId = conflict.id;
    //   throw e;
    // };

    if (err.code === "SLOT_CONFLICT") {
      session.data.confirmError = "Цей час вже хтось бронює...";
      setStep(session, STEPS.DATE); // повертаємо на вибір часу, щоб користувач міг обрати інший час
    }

    await ctx.answerCbQuery("❌ Помилка створення запису", {
      show_alert: true,
    });
    return renderStep(ctx, session); // після setStep(session, STEPS.TIME);  має рендерити екран вибору часу з помилкою session.data.confirmError
  }
}

async function validatePromoBeforeBooking(session) {
  const promo = session.data?.promo;
  const pricing = session.data?.pricing;
  const promoPricing = pricing?.promo;

  if (!promo?.valid || !promo.promoSessionId || !promoPricing?.promoId) {
    return { ok: true };
  }

  try {
    const result = await sheetsApi.promoValidate({
      promoSessionId: promo.promoSessionId,
      linkToken: promo.linkToken,
      enteredCode: promo.enteredCode || promo.code || promoPricing.code,
      tgId: session.data?.tgId || "",
      chatId: session.data?.chatId || "",
      serviceId: session.data?.serviceId || "wash",
      clientType: session.data?.clientType || "retail",
    });

    if (!result?.valid) {
      return { ok: false, reason: result?.reason || "invalid_code" };
    }

    return { ok: true };
  } catch (e) {
    console.warn("promoValidate before booking failed:", e?.message || e);
    return { ok: false, reason: "validation_failed" };
  }
}

async function consumePromoForBooking(session, booking) {
  const promo = session.data?.promo;
  const pricing = session.data?.pricing;
  const promoPricing = pricing?.promo;

  if (!promo?.valid || !promo.promoSessionId || !promoPricing?.promoId) return;

  try {
    const result = await sheetsApi.promoConsume({
      promoSessionId: promo.promoSessionId,
      promoId: promoPricing.promoId,
      bookingId: booking?.id || session.data?.id || "",
      tgId: session.data?.tgId || "",
      serviceId: session.data?.serviceId || "wash",
      clientType: session.data?.clientType || "retail",
      originalPrice: pricing?.originalTotalPrice ?? pricing?.totalPrice ?? "",
      discountAmount: pricing?.discountAmount ?? "",
      finalPrice: pricing?.totalPrice ?? "",
    });

    if (!result?.consumed) {
      console.warn("promoConsume skipped:", result?.reason || result);
      return;
    }

    session.data.promo = {
      ...promo,
      status: "booking_created",
      usedCount: result.usedCount,
    };
  } catch (e) {
    console.warn("promoConsume failed:", e?.message || e);
  }
}

function promoConfirmErrorMessage(reason) {
  switch (reason) {
    case "exhausted":
      return "Ліміт використань цього промокоду вже вичерпано.";
    case "already_used_by_client":
      return "Ви вже скористалися цим промокодом.";
    case "expired":
      return "Термін дії цього промокоду вже завершився.";
    case "not_started":
      return "Ця акційна пропозиція ще не активна.";
    case "validation_failed":
      return "Не вдалося повторно перевірити промокод. Спробуйте ще раз.";
    default:
      return "Промокод уже недійсний. Перевірте код або почніть запис заново.";
  }
}
