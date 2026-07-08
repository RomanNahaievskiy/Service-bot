import { BUSINESS_CONFIG } from "../../config/business.config.js";
import { sheetsApi } from "../../integrations/sheetsApi.js";
import { toKyivISO } from "../../utils/helpers.js";
import {
  ymdFromDateLike,
  zonedDateTimeToDate,
} from "../../utils/timezone.js";

export async function createBooking(data) {
  const timeHHMM = extractTimeHHMM(data.time);
  const dateYMD = ymdFromDateLike(data.date, BUSINESS_CONFIG.TIME_ZONE);

  const start = zonedDateTimeToDate(
    dateYMD,
    timeHHMM,
    BUSINESS_CONFIG.TIME_ZONE,
  );

  if (Number.isNaN(start.getTime())) {
    throw new Error("Invalid start datetime");
  }

  const duration = Number(
    data?.pricing?.totalDurationMin ??
      data?.service?.durationMin ??
      data?.service?.duration ??
      30,
  );

  const safeDuration =
    Number.isFinite(duration) && duration > 0 ? duration : 30;

  const end = new Date(start.getTime() + safeDuration * 60000);
  const now = new Date().toISOString();

  const optionIdsArr = Array.isArray(data.optionIds)
    ? data.optionIds
    : String(data.optionIds || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

  const totalPrice = Number(data?.pricing?.totalPrice ?? data?.totalPrice ?? 0);
  const originalPrice = Number(data?.pricing?.originalTotalPrice ?? totalPrice);
  const discountAmount = Number(data?.pricing?.discountAmount ?? 0);
  const promoPricing = data?.pricing?.promo || {};
  const promo = data?.promo || {};

  const payload = {
    id: String(data.id || crypto.randomUUID()),
    createdAt: String(data.createdAt || now),

    tgId: String(data.tgId || data.userId || ""),
    fullName: String(data.fullName || "—"),
    phone: String(data.phone || ""),

    clientType: String(data.clientType || "retail"),
    contractNo: String(
      data.clientType === "contract" ? data.contractNo || "" : "",
    ),

    serviceId: String(
      data.serviceId || data?.service?.serviceId || data?.service?.id || "",
    ),
    serviceTitle: String(
      data.serviceTitle || data?.service?.title || data?.service?.name || "—",
    ),

    vehicleId: String(
      data.vehicleId || data?.vehicle?.vehicleId || data?.vehicle?.id || "",
    ),
    vehicleTitle: String(
      data.vehicleTitle ||
        data?.prices?.vehicles?.find((v) => v.vehicleId === data?.vehicleId)
          ?.vehicleTitle ||
        data?.vehicle?.title ||
        data?.vehicle?.name ||
        (typeof data.vehicle === "string" ? data.vehicle : "") ||
        "—",
    ),
    vehicleNumber: String(data.vehicleNumber || ""),

    startsAt: toKyivISO(start),
    endsAt: toKyivISO(end),

    optionIds: optionIdsArr.join(","),
    totalPrice: Number.isFinite(totalPrice) ? totalPrice : 0,
    totalDurationMin: safeDuration,
    originalPrice: Number.isFinite(originalPrice) ? originalPrice : 0,
    discountAmount: Number.isFinite(discountAmount) ? discountAmount : 0,
    promoFinalPrice: Number.isFinite(totalPrice) ? totalPrice : 0,
    promoId: String(promoPricing.promoId || promo.promoId || ""),
    promoCode: String(
      promoPricing.code || promo.code || promo.enteredCode || "",
    ),
    promoTag: String(promoPricing.tag || promo.tag || ""),
    promoDiscountType: String(
      promoPricing.discountType || promo.discountType || "",
    ),
    promoDiscountValue: String(
      promoPricing.discountValue ?? promo.discountValue ?? "",
    ),
    promoSessionId: String(promo.promoSessionId || ""),

    comment: String(data.comment || ""),
    status: String(data.status || "new"),
    admin: String(data.admin || ""),
    updatedAt: String(now),
  };

  return await sheetsApi.createBooking(payload);
}

function extractTimeHHMM(time) {
  const s = String(time || "").trim();

  let m = s.match(/^TIME_(\d{1,2}):(\d{2})$/);
  if (m) return `${m[1].padStart(2, "0")}:${m[2]}`;

  m = s.match(/^(\d{1,2}):(\d{2})$/);
  if (m) return `${m[1].padStart(2, "0")}:${m[2]}`;

  m = s.match(/^(\d{1,2}):(\d{2}):\d{2}$/);
  if (m) return `${m[1].padStart(2, "0")}:${m[2]}`;

  throw new Error(`Invalid time format: ${s}`);
}
