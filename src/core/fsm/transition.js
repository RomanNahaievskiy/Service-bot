export function goToStep(session, nextStep) {
  session.history.push({
    step: session.step,
    data: structuredClone(session.data), // Зберігаємо копію даних сесії
  });

  session.step = nextStep;
}
