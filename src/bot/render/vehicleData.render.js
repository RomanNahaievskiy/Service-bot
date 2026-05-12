import { Markup } from "telegraf";
import { safeEditOrReply } from "./safeEditOrReply.js";

export async function renderVehicleData(ctx, session) {
  // Перевірка, чи клієнт є за договором
  const isClientContract = session.data.clientType === "contract";

  if (isClientContract) {
    const vehicles = (session.data.contractVehicles || []).filter(
      (v) =>
        v && (v.active === true || v.active === "TRUE" || v.active === "true"),
    );

    if (!vehicles.length) {
      return safeEditOrReply(
        ctx,
        "❌ За цим договором не знайдено активних ТЗ.\nВведіть інший номер договору або натисніть «На початок».",
        Markup.inlineKeyboard([
          [Markup.button.callback("↩️ На початок", "START_OVER")],
        ]),
      );
    }

    // Ряди кнопок: по 1 номеру в ряд (зручно для читання)
    const rows = vehicles.map((v) => {
      const label = v.alias
        ? `${v.vehicleNumber} — ${v.alias}`
        : v.vehicleNumber;
      // callback data краще по vehicleId (стабільніше), а не по номеру
      //return [Markup.button.callback(label, `CV_${v.vehicleId}`)];
      const code = encodeURIComponent(v.vehicleNumber); // безпечно
      return [Markup.button.callback(label, `CVN_${code}`)];
    });

    // навігація
    rows.push([Markup.button.callback("⬅️ Назад", "BACK")]);
    rows.push([Markup.button.callback("↩️ На початок", "START_OVER")]);

    return safeEditOrReply(
      ctx,
      "🚗 Оберіть транспорт за договором зі списку 👇",
      Markup.inlineKeyboard(rows),
    );
  } else {
    const vehicleTitle =
      session.data?.prices?.vehicles?.find(
        (v) => v.vehicleId === session.data?.vehicleId,
      )?.vehicleTitle ||
      session.data?.vehicle?.title ||
      "—";

    const price = session.data?.pricing?.totalPrice;
    const duration = session.data?.pricing?.totalDurationMin;

    const extra =
      price || duration
        ? `\n💰 Орієнтовна вартість: ${price ?? "—"} грн\n⏱ Тривалість: ${
            duration ?? "—"
          } хв\n`
        : "";

    return safeEditOrReply(
      ctx,
      `Введіть реєстраційний номер транспорту\n\n` + `Наприклад: *ВС1234АА* `,
      Markup.inlineKeyboard([
        [Markup.button.callback("⬅️ Назад", "BACK")],
        [Markup.button.callback("↩️ На початок", "START_OVER")],
      ]),
    );
  }
}
