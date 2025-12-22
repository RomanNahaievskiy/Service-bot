import { Markup } from "telegraf";
import { SERVICES } from "../../core/domain/services.js";

export function serviceKeyboard() {
  return Markup.inlineKeyboard(
    Object.values(SERVICES).map((service) => [
      Markup.button.callback(
        service.title,
        `SERVICE_${service.id.toUpperCase()}`
      ),
    ])
  );
}
