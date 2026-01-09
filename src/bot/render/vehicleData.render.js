import { Markup } from "telegraf";
import { safeEditOrReply } from "./safeEditOrReply.js";

export async function renderVehicleData(ctx, session) {
  const vehicleTitle =
    session.data?.prices?.vehicles?.find(
      (v) => v.vehicleId === session.data?.vehicleId
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
    `📝 Введіть номер або опис транспорту\n\n` +
      `Обрано: ${vehicleTitle}\n` +
      extra +
      `Наприклад: *ВС1234АА* або *Neoplan чорний, 2 поверхи*`,
    Markup.inlineKeyboard([
      [Markup.button.callback("⬅️ Назад", "BACK")],
      [Markup.button.callback("↩️ На початок", "START_OVER")],
    ])
  );
}
