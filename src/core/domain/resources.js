// Зчитування конфігурації бізнесу (ресурсів)
import { BUSINESS_CONFIG } from "../../config/business.config.js";

export function buildResources() {
  const resources = [];
  let id = 1;

  // портальні мийки
  for (let i = 1; i <= BUSINESS_CONFIG.PORTAL_WASH_COUNT; i++) {
    resources.push({
      id: id++,
      type: "portal",
      name: `Портал №${i}`,
    });
  }

  // сервісні бокси
  for (let i = 1; i <= BUSINESS_CONFIG.SERVICE_BOX_COUNT; i++) {
    resources.push({
      id: id++,
      type: "box",
      name: `Бокс №${i}`,
    });
  }

  return resources;
}
