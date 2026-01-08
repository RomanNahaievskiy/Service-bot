import { BUSINESS_CONFIG } from "../../config/business.config.js";
import { timeToMinutes, minutesToTime } from "../../utils/dates.js";
/**
 * Генерує слоти на конкретну дату.
 * - Для сьогодні: від "зараз" (округлення вгору до кроку) до кінця робочого дня.
 * - Для майбутніх дат: від початку робочого дня.
 * - Для минулих дат: [].
 *
 * @param {Object} params
 * @param {number} params.serviceDuration - тривалість послуги в хвилинах
 * @param {number} [params.slotStep] - крок слотів (хв)
 * @param {Date}   [params.forDate] - дата, для якої генеруємо (за замовчуванням сьогодні)
 * @param {Date}   [params.now] - "зараз" (для тестів; за замовчуванням new Date())
 * @param {number} [params.leadTimeMinutes] - мін. буфер до старту слота (хв), напр. 10
 */
export function generateDaySlots({
  serviceDuration,
  slotStep = BUSINESS_CONFIG.SLOT_STEP_MINUTES,
  forDate = new Date(),
  now = new Date(),
  leadTimeMinutes = 0,
}) {
  const dayStartMin = timeToMinutes(BUSINESS_CONFIG.WORKDAY_START);
  const dayEndMin = timeToMinutes(BUSINESS_CONFIG.WORKDAY_END);

  // нормалізація дат до "дня" (без часу)
  const dayKey = (d) => {
    const x = new Date(d);
    x.setHours(0, 0, 0, 0);
    return x.getTime();
  };

  const targetDay = dayKey(forDate);
  const today = dayKey(now);

  // минулі дні — без слотів
  if (targetDay < today) return [];

  // визначаємо з якого часу стартувати генерацію
  let startMin = dayStartMin;

  // якщо це сьогодні — беремо поточний час + буфер і округляємо вгору до кроку
  if (targetDay === today) {
    const nowMinRaw = now.getHours() * 60 + now.getMinutes() + leadTimeMinutes;
    startMin = Math.max(dayStartMin, ceilToStep(nowMinRaw, slotStep));
  }

  // якщо вже пізно — слотів нема
  if (startMin + serviceDuration > dayEndMin) return [];

  const slots = [];
  for (
    let current = startMin;
    current + serviceDuration <= dayEndMin;
    current += slotStep
  ) {
    slots.push({
      start: minutesToTime(current),
      end: minutesToTime(current + serviceDuration),
    });
  }
  return slots;
}

function ceilToStep(value, step) {
  return Math.ceil(value / step) * step;
}
