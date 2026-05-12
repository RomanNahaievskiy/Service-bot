import { STEPS } from "../../core/fsm/steps.js";
import { getSession } from "../../utils/helpers.js";
import { goToStep } from "../../core/fsm/transition.js";
import { renderStep } from "../render/renderStep.js";
import { sheetsApi } from "../../integrations/sheetsApi.js";

const SIMILAR_MAP = {
  А: "A",
  В: "B",
  С: "C",
  Е: "E",
  Н: "H",
  І: "I",
  К: "K",
  М: "M",
  О: "O",
  Р: "P",
  Т: "T",
  Х: "X",
};

function normalizePlate(value) {
  return String(value || "")
    .toUpperCase()
    .trim()
    .split("")
    .map((ch) => SIMILAR_MAP[ch] || ch)
    .join("")
    .replace(/\s+/g, "")
    .replace(/[^A-Z0-9]/g, "");
}

function getVehicleNumber(v) {
  return (
    v?.vehicleNumber ??
    v?.vehicleNo ??
    v?.plate ??
    v?.vehiclePlate ??
    v?.regNumber ??
    v?.number ??
    ""
  );
}

export async function contractVehicleHandler(ctx) {
  console.log("<ContractVehicle handler>");

  const chatId =
    ctx.chat?.id ??
    ctx.callbackQuery?.message?.chat?.id ??
    ctx.update?.callback_query?.message?.chat?.id;

  const session = getSession(chatId);
  if (session.step !== STEPS.CONTRACT_VEHICLE) return;

  const rawInput = String(ctx.message?.text ?? "").trim();
  if (!rawInput) return;

  const normalizedInput = normalizePlate(rawInput);

  try {
    console.log("payload :", {
      vehicleNumber: normalizedInput,
    });

    const v = await sheetsApi.botContractVehicleResolve({
      vehicleNumber: normalizedInput,
    });

    if (!v) {
      session.data.contractVehicleError = `Транспортний засіб з номером "${rawInput}" не знайдено.`;
      return renderStep(ctx, session);
    }

    session.data.contractVehicleError = null;
    session.data.contractNoError = null;

    session.data.contractNo = v.contractNo || "";
    session.data.contractVehicle = v;

    session.data.vehicleGroup =
      v.vehicleGroup ||
      session.data?.prices?.vehicles?.find((x) => x.vehicleId === v.vehicleId)
        ?.group ||
      session.data.vehicleGroup ||
      "passenger";

    session.data.vehicleNumber = getVehicleNumber(v) || rawInput;
    session.data.vehicleId = v.vehicleId ?? v.id ?? null;
    session.data.vehicleTitle =
      v.vehicleTitle || getVehicleNumber(v) || rawInput;
    session.data.vehicleType =
      v.vehicleType ?? v.type ?? session.data.vehicleType ?? null;
    session.data.vehicleAlias = v.alias || null;

    goToStep(session, STEPS.OPTIONS);
    return renderStep(ctx, session);
  } catch (e) {
    console.error("contractVehicleHandler error:", e);

    session.data.contractVehicleError =
      "Не вдалося знайти транспортний засіб. Перевірте номер і спробуйте ще раз.";
    return renderStep(ctx, session);
  }
}
