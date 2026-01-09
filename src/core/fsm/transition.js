// Функція для встановлення кроку без збереження в історію
// (для логічного розгалуження)
export function setStep(session, nextStep) {
  session.step = nextStep;
}

// Функції для збереження та відновлення даних сесії
export function snapshotData(data) {
  const d = structuredClone(data);
  if (d.date instanceof Date) d.date = d.date.toISOString(); // стабільно
  return d;
}

export function restoreData(data) {
  const d = data || {};
  if (typeof d.date === "string") d.date = new Date(d.date);
  return d;
}

export function goToStep(session, nextStep) {
  session.history.push({
    step: session.step,
    data: snapshotData(session.data),
  });
  session.step = nextStep;
}
