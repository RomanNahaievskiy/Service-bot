export const SERVICES = {
  WASH: {
    // Мийка
    id: "wash",
    title: "🚿 Мийка зовнішня",
    duration: 30, // тривалість у хвилинах
    resources: ["portal", "box"], // необхідні ресурси
  },

  WASH_CONTRACT: {
    // Мийка по договору
    id: "wash_contract",
    title: "🚿 Мийка зовнішня (Контракт)",
    duration: 30, // тривалість у хвилинах
    resources: ["portal", "box"], // необхідні ресурси
  },
  // DETAILING: {
  //   // Детейлінг
  //   id: "detailing",
  //   title: "✨ Детейлінг",
  //   duration: 120, // тривалість у хвилинах
  //   resources: ["box"], //  необхідні ресурси
  // },
  // REPAIR: {
  //   // Ремонт
  //   id: "repair",
  //   title: "🔧 Ремонт",
  //   duration: 90, // тривалість у хвилинах
  //   resources: ["service_box"], // необхідні ресурси
  // },
  // DIAGNOSTICS: {
  //   // Діагностика
  //   id: "diagnostics",
  //   title: "🛠️ Діагностика",
  //   duration: 60, // тривалість у хвилинах
  //   resources: ["service_box"], // необхідні ресурси
  // },
  // Додайте інші послуги за потреби
};
// Функція для отримання послуги за callback даними
export function getServiceByCallback(callbackData) {
  return Object.values(SERVICES).find(
    (service) => `SERVICE_${service.id.toUpperCase()}` === callbackData,
  );
}
