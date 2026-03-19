import { Markup } from "telegraf";
import { safeEditOrReply } from "./safeEditOrReply.js";
import { sheetsApi } from "../../integrations/sheetsApi.js"; // залежність для контрактного прайсу

// export async function renderOptions(ctx, session) {
//   await ensureContractPricingForOptions(session); // якщо це контракт, то підтягуємо актуальні ціни з GAS перед рендером (на випадок, якщо вони змінилися після вибору транспорту)

//   const prices = session.data?.prices;
//   const vehicleId = session.data?.vehicleId;
//   const vehicleGroup = session.data?.vehicleGroup;

//   if (!prices || !vehicleId) {
//     return safeEditOrReply(
//       ctx,
//       "❌ Неможливо показати додаткові послуги. Дані відсутні.",
//       Markup.inlineKeyboard([[Markup.button.callback("⬅️ Назад", "BACK")]]),
//     );
//   }

//   const selected = session.data.optionIds ?? []; // масив optionId

//   const options = prices.options.filter((o) => {
//     if (!o.active) return false;

//     // applicableGroup
//     if (o.applicableGroup !== "all" && o.applicableGroup !== vehicleGroup)
//       return false;

//     // applicableVehicleId
//     if (o.applicableVehicleId !== "all" && o.applicableVehicleId !== vehicleId)
//       return false;

//     return true;
//   });

//   if (!options.length) {
//     calculateSummary(session); // щоб мати актуальні дані для confirm
//     return safeEditOrReply(
//       ctx,
//       "ℹ️ Для цього транспорту немає додаткових послуг.",
//       Markup.inlineKeyboard([
//         [Markup.button.callback("⬅️ Назад", "BACK")],
//         [Markup.button.callback("➡️ Продовжити", "OPT_DONE")],
//       ]),
//     );
//   }

//   const buttons = options.map((o) => {
//     const isOn = selected.includes(o.optionId);
//     const mark = isOn ? "✅" : "⬜️";

//     return [
//       Markup.button.callback(
//         `${mark} ${o.optionTitle} (+${o.price} грн / ${o.durationMin} хв)`,
//         `OPT_TOGGLE_${o.optionId}`,
//       ),
//     ];
//   });

//   const d = session.data || {};
//   const pricing = d.pricing;

//   const totalPrice = pricing?.totalPrice ?? 0;

//   const totalDurationMin = pricing?.totalDurationMin ?? 0;

//   // const summary = calculateSummary(session);
//   const summary = session.data.pricing ?? {
//     totalPrice: 0,
//     totalDurationMin: 0,
//   };

//   buttons.push([
//     Markup.button.callback("⬅️ Назад", "BACK"),
//     Markup.button.callback("➡️ Продовжити", "OPT_DONE"),
//   ]);

//   return safeEditOrReply(
//     ctx,
//     `➕ Додаткові послуги\n\n` +
//       `💰 Поточна вартість: ${summary.totalPrice} грн\n` +
//       `⏱ Тривалість: ${summary.totalDurationMin} хв`,
//     Markup.inlineKeyboard(buttons),
//   );
// }

export async function renderOptions(ctx, session) {
  await ensureContractPricingForOptions(session); // багаторесурсна хрєнь потребує кешування!!!
  // щоб не стріляти GAS кожен раз при рендері, якщо це контракт і ми вже підвантажували ціни для цього набору виборів
  // (contractNo + vehicleId + serviceId + optionIds) , бо вони можуть бути індивідуальними і змінюватися в залежності від вибору користувача,
  // тому важливо мати актуальні дані перед рендером

  const prices = session.data?.prices; // дефолтні рітейл ціни  (але prices != ensureContractPricingForOptions , бо там pricing )

  const vehicleId = session.data?.vehicleId;
  const vehicleGroup = session.data?.vehicleGroup;

  if (!prices || !vehicleId) {
    return safeEditOrReply(
      ctx,
      "❌ Неможливо показати додаткові послуги. Дані відсутні.",
      Markup.inlineKeyboard([[Markup.button.callback("⬅️ Назад", "BACK")]]),
    );
  }

  const selected = session.data.optionIds ?? [];

  const options = prices.options.filter((o) => {
    if (!o.active) return false;
    if (o.applicableGroup !== "all" && o.applicableGroup !== vehicleGroup)
      return false;
    if (o.applicableVehicleId !== "all" && o.applicableVehicleId !== vehicleId)
      return false;
    return true;
  });

  const isContract = session.data?.clientType === "contract";
  const buttons = options.map((o) => {
    const isOn = selected.includes(o.optionId);
    const mark = isOn ? "✅" : "⬜️";

    const label = isContract
      ? `${mark} ${o.optionTitle} (+ ${o.durationMin} хв)`
      : `${mark} ${o.optionTitle}(+${o.price} грн / ${o.durationMin} хв)`; // для контракту не показуємо ціну та час, бо вони можуть бути індивідуальними і вже враховані в загальному прайсі
    return [Markup.button.callback(label, `OPT_TOGGLE_${o.optionId}`)];
  });

  // ✅ summary: contract беремо з pricing, retail — рахуємо
  let summary;
  if (session.data.clientType === "contract") {
    // summary = session.data.pricing ?? { totalPrice: 0, totalDurationMin: 0 };
    summary = calculateSummaryContract(session);
  } else {
    summary = calculateSummaryRetail(session); // перейменуємо, щоб було ясно
  }

  buttons.push([
    Markup.button.callback("⬅️ Назад", "BACK"),
    Markup.button.callback("➡️ Продовжити", "OPT_DONE"),
  ]);

  return safeEditOrReply(
    ctx,
    `➕ Додаткові послуги\n\n` +
      `${isContract ? "Транспортний засіб: " + session.data.vehicleAlias + ". Тип: " + session.data.vehicleTitle + "\n" : ""}` +
      `${isContract ? "💰 Вартість згідно умов договору " : `💰 Поточна вартість: ${summary.totalPrice} грн\n`} ` +
      `⏱ Тривалість: ${summary.totalDurationMin} хв\n
      ${
        // показати назви вибраних опцій також в хендлері зберегти в сесію, щоб не шукати кожного разу по id
        selected.length > 0
          ? `📋 Вибрані послуги: ${selected
              .map(
                (id) =>
                  prices.options.find((o) => o.optionId === id)?.optionTitle,
              )
              .filter(Boolean)
              .join(", ")}`
          : ""
      }`,
    Markup.inlineKeyboard(buttons),
  );
}

/* ===== retail only ===== */
function calculateSummaryRetail(session) {
  const prices = session.data.prices; //всі ціни, включаючи опції, які ми отримали з GAS при виборі транспорту (але без контрактних, бо вони підтягуються окремо і мають пріоритет для контракту)
  const vehicleId = session.data.vehicleId;
  const selected = session.data.optionIds ?? [];

  const vehicle = prices.vehicles.find((v) => v.vehicleId === vehicleId);

  let totalPrice = vehicle?.basePrice ?? 0;
  let totalDurationMin = vehicle?.baseDurationMin ?? 0;

  for (const optId of selected) {
    const opt = prices.options.find((o) => o.optionId === optId);
    if (!opt) continue;
    totalPrice += opt.price || 0;
    totalDurationMin += opt.durationMin || 0;
  }

  // ✅ retail кешуємо, contract — НЕ чіпаємо
  session.data.pricing = { totalPrice, totalDurationMin, source: "retail" };
  console.log("Updated session.data.pricing for retail:", session.data.pricing);
  return { totalPrice, totalDurationMin };
}

/* ================= helpers ================= */

// function calculateSummary(session) {
//   const prices = session.data.prices;
//   const vehicleId = session.data.vehicleId;
//   const selected = session.data.optionIds ?? [];

//   const vehicle = prices.vehicles.find((v) => v.vehicleId === vehicleId);

//   let totalPrice = vehicle?.basePrice ?? 0;
//   let totalDurationMin = vehicle?.baseDurationMin ?? 0;

//   for (const optId of selected) {
//     const opt = prices.options.find((o) => o.optionId === optId);
//     if (!opt) continue;

//     totalPrice += opt.price || 0;
//     totalDurationMin += opt.durationMin || 0;
//   }

//   // кешуємо для confirm
//   session.data.pricing = { totalPrice, totalDurationMin };

//   return { totalPrice, totalDurationMin };
// }

function calculateSummaryContract(session) {
  const d = session.data || {};
  const selected = d.optionIds ?? [];
  const pl = d.pricing; // тут лежить { basePrice, baseDurationMin, optionsPriceList }

  const basePrice = Number(pl?.basePrice || 0);
  const baseDurationMin = Number(pl?.baseDurationMin || 0);

  const map = new Map(
    (pl?.optionsPriceList || []).map((o) => [String(o.optionId), o]),
  );

  let totalPrice = basePrice;
  let totalDurationMin = baseDurationMin;

  for (const id of selected) {
    const o = map.get(String(id));
    if (!o) continue;
    totalPrice += Number(o.price || 0);
    totalDurationMin += Number(o.durationMin || 0);
  }

  // кешуємо totals окремо, щоб CONFIRM їх бачив
  d.summary = { totalPrice, totalDurationMin };
  session.data = d;

  return { totalPrice, totalDurationMin };
}

async function ensureContractPricingForOptions(session) {
  const d = session.data || {};
  if (d.clientType !== "contract") return;

  const contractNo = d.contractNo;
  const vehicleId = d.vehicleId;
  const serviceId = d.serviceId || "wash";
  // const optionIds = d.optionIds ?? [];

  if (!contractNo || !vehicleId) return; // guard

  // 🔒 simple cache key щоб не стріляти GAS кожен раз без потреби
  const key = `${contractNo}|${vehicleId}|${serviceId}`;

  if (d._contractPricingKey === key && d.pricing?.source === "contract") return;
  console.log("🔄 Fetching contract pricing for options from GAS...");
  // const pricing = await sheetsApi.contractPricingGet({
  //   contractNo,
  //   vehicleId,
  //   serviceId,
  //   optionIds,
  // });

  const pricing = await sheetsApi.contractOptionPricesGet({
    contractNo,
    vehicleId,
    serviceId,
  });

  d.pricing = pricing; // canonical payload
  d._contractPricingKey = key;
  session.data = d;
  console.log("✅ Contract pricing updated in session.data.pricing");
  // console.log("Current contract session.data.pricing:", pricing);
}
