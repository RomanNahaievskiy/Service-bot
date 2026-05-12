# 🧱 Загальна архітектура (production-ready)

```
src/
├─ app.js                 ← точка входу
├─ bot/
│   ├─ index.js           ← ініціалізація Telegraf
│   ├─ router.js          ← маршрутизація подій
│   ├─ keyboards/
│   │   ├─ main.keyboard.js
│   │   ├─ service.keyboard.js
│   │   ├─ vehicle.keyboard.js
│   │   ├─ date.keyboard.js
│   │   └─ confirm.keyboard.js
│   └─ handlers/
│       ├─ start.handler.js
│       ├─ service.handler.js
│       ├─ vehicle.handler.js
│       ├─ schedule.handler.js
│       ├─ confirm.handler.js
│       ├─ cancel.handler.js
│       └─ back.handler.js
│
├─ core/
│   ├─ fsm/
│   │   ├─ steps.js        ← enum кроків
│   │   ├─ machine.js     ← керування переходами
│   │   └─ guards.js      ← перевірки
│   │
│   ├─ domain/
│   │   ├─ services.js    ← мийка / ремонт / інше
│   │   ├─ resources.js   ← портали / бокси
│   │   ├─ vehicles.js
│   │   └─ schedule.js
│   │
│   ├─ planner/
│   │   ├─ slot.generator.js
│   │   ├─ availability.js
│   │   └─ allocator.js
│   │
│   └─ notifications/
│       ├─ scheduler.js
│       └─ templates.js
│
├─ db/
│   ├─ index.js
│   ├─ migrations/
│   ├─ repositories/
│   │   ├─ booking.repo.js
│   │   ├─ service.repo.js
│   │   ├─ resource.repo.js
│   │   └─ user.repo.js
│
├─ config/
│   ├─ env.js
│   ├─ bot.config.js
│   └─ business.config.js
│
├─ utils/
│   ├─ dates.js
│   ├─ logger.js
│   └─ helpers.js
│
└─ constants/
    ├─ actions.js
    ├─ messages.js
    └─ errors.js
```

---

# 🧠 Ключові принципи (дуже важливо)

## 1️⃣ Bot ≠ логіка

**bot/** — тільки Telegram
**core/** — вся бізнес-логіка

👉 Завтра заміниш Telegram на сайт — код залишиться.

---

## 2️⃣ FSM — основа всього

### `core/fsm/steps.js`

```js
export const STEPS = {
  START: "START",
  SERVICE: "SERVICE",
  VEHICLE_TYPE: "VEHICLE_TYPE",
  VEHICLE_DATA: "VEHICLE_DATA",
  DATE: "DATE",
  TIME: "TIME",
  CONFIRM: "CONFIRM",
  DONE: "DONE",
};
```

---

## 3️⃣ Domain = бізнес-модель

### `core/domain/services.js`

```js
export const SERVICES = {
  WASH: {
    id: "wash",
    title: "🚿 Мийка",
    duration: 30,
    resources: ["portal", "box"],
  },
  DETAILING: {
    id: "detailing",
    title: "✨ Детейлінг",
    duration: 120,
    resources: ["box"],
  },
  REPAIR: {
    id: "repair",
    title: "🔧 Ремонт",
    duration: 90,
    resources: ["service_box"],
  },
};
```

➡️ Додаєш нову послугу **без змін бота**.

---

## 4️⃣ Ресурси — масштабування мийок

### `core/domain/resources.js`

```js
export const RESOURCES = [
  { id: 1, type: "portal", name: "Портал №1" },
  { id: 2, type: "portal", name: "Портал №2" },
  { id: 3, type: "box", name: "Бокс №1" },
];
```

---

## 5️⃣ Планувальник слотів (серце системи)

```
planner/
 ├─ slot.generator.js   ← генерує час
 ├─ availability.js    ← перевіряє зайнятість
 └─ allocator.js       ← призначає ресурс
```

👉 Саме тут реалізується:

- кілька портальних мийок
- різна тривалість послуг
- уникнення конфліктів

---

## 6️⃣ Нагадування — окремий модуль

```
notifications/
 ├─ scheduler.js
 └─ templates.js
```

👉 Працює **незалежно від Telegram**.

---

## 7️⃣ DB через репозиторії (обовʼязково)

```
db/repositories/
 ├─ booking.repo.js
 ├─ service.repo.js
 └─ resource.repo.js
```

❌ Ніяких SQL у handlers
✅ handlers → repositories

---

# 🛠 Мінімальний стартовий набір файлів

Щоб **не злякатися**, створи спочатку:

```
src/
├─ app.js
├─ bot/index.js
├─ bot/handlers/start.handler.js
├─ core/fsm/steps.js
├─ core/domain/services.js
├─ core/domain/resources.js
├─ db/index.js
├─ config/env.js
```

---

# 🚀 Наступний крок

Коли ти:

- ✔ створиш папки
- ✔ створиш порожні файли

👉 напиши **«скелет готовий»**,
і я дам:

- стартовий `app.js`
- підключення Telegraf
- перший `start.handler`
- FSM-переходи

Йдемо дуже правильно 👌

https://ukrline.com.ua/wiki/ua/telegram-bot.php example Docker

новий етап 0) Ціль

Один renderStep() керує UI для всіх кроків
Хендлери лише змінюють session (data + step) і викликають renderStep
Прайс/тривалість беруться з Google Sheets через GAS (з кешем у Node)
Слоти часу генеруються від загальної тривалості (base + options)

1. Модель даних у сесії
   Мінімально (те, що потрібно для обчислень та UI):

session.step
session.data = {
serviceId, // напр. "wash"
vehicleGroup, // passenger/cargo/tanker
vehicleId, // micro_18, bus_30...
optionIds: [], // ["engine_big","undercarriage"]
date, // Date
time, // "19:00"
phone,
fullName,

pricing: { // результат calc
basePrice,
baseDurationMin,
optionsPrice,
optionsDurationMin,
totalPrice,
totalDurationMin
}
}
session.nav.stack = [ snapshot... ] // для BACK

2. Стани FSM (оновлений роадмап)

Твої поточні + додамо опції:
START
SERVICE
VEHICLE_GROUP (пасажирський/вантажний/цистерна/інше)
VEHICLE_TYPE (micro_18, bus_30, truck_10t…)
OPTIONS (чекбокси, multi-select)
VEHICLE_DATA (номер/опис ТЗ)
DATE
TIME
PHONE
CONFIRM
DONE

Якщо хочеш залишити VEHICLE_DATA раніше — можна, але логічніше після OPTIONS (щоб summary був повний).

3. Sheets / GAS: що потрібно додати
   3.1 Аркуші

VehiclePrices(vehicleId, group, title, basePrice, baseDurationMin, active)

OptionPrices(optionId, title, price, durationMin, applicableGroup, applicableVehicleId, active)

3.2 Новий action в GAS

Додати в GAS:

action = "prices_get" → повертає весь прайс JSON
(або 2 масиви: vehicles/options)

4. Node integrations: pricing service (кеш + calc)

Створи src/core/services/pricing.service.js:

getPriceConfig()

викликає sheetsApi.pricesGet()

кеш 5–15 хв

calcPricing({ vehicleId, group, optionIds }):

base з VehiclePrices

опції відфільтрувати по applicable

підсумок: price + duration

Цей calc запускається:

після вибору vehicle

після кожного toggle опції

5. Універсальний рендер (UI)
   5.1 renderStep(ctx, session)
   Єдиний switch(session.step):
   формує текст + клавіатуру
   показує підсумок (ціна/тривалість) там, де треба (OPTIONS, DATE, TIME, CONFIRM)

5.2 safeEditOrReply(ctx, ...)
Щоб не думати, звідки прийшли (callback чи message):
пробує editMessageText
якщо не можна — reply

5.3 Кнопка назад
Всюди одна:
callback: "BACK"
І один backHandler + nav stack.

6. Хендлери: що міняємо

Правило для всіх handler’ів:
pushSnapshot(session)
змінити session.data / session.step
return renderStep(ctx, session)

6.1 Forward handlers
serviceHandler → set serviceId → step VEHICLE_GROUP
vehicleGroupHandler → set group → step VEHICLE_TYPE
vehicleTypeHandler → set vehicleId → session.data.pricing = calcPricing(...) → step OPTIONS

optionsToggleHandler → toggle optionIds → recalc pricing → залишаємо step OPTIONS
optionsDoneHandler → step VEHICLE_DATA
vehicleDataHandler → set vehicleNumber → step DATE
dateHandler → set date → step TIME
timeSelectHandler → set time → step PHONE
phoneHandler → set phone/fullName → step CONFIRM
confirmHandler → createBooking (end = start + totalDurationMin) → step DONE

7. Slots: вільні слоти за тривалістю
   TIME step повинен викликати:
   duration = session.data.pricing.totalDurationMin
   getFreeDaySlots(date, duration):
   згенерувати всі слоти дня
   відфільтрувати зайняті (через sheetsApi.list або окремий bookings_by_day)
   показати тільки вільні

MVP: sheetsApi.list + фільтр по даті в Node (можна одразу в GAS додати list_by_day).

8. Booking payload у Sheets

У createBooking (Node):
startsAt = бізнес час (Kyiv ISO або UTC — твій вибір)
endsAt = start + totalDurationMin
serviceId, vehicleId, optionIds (рядок)
totalPrice, totalDurationMin
phone, fullName, vehicleNumber

9. Порядок робіт (короткий план по кроках)

Крок 1. Sheets: зробити аркуші прайсу + GAS prices_get
Крок 2. Node: sheetsApi.pricesGet() + pricing.service.js (кеш + calc)
Крок 3. FSM: додати VEHICLE_GROUP, OPTIONS (toggle/done)
Крок 4. UI: додати renderStep + safeEditOrReply (мінімально для 3–4 step)
Крок 5. Навігація: BACK + nav stack (snapshot data)
Крок 6. Slots: генерувати по totalDurationMin + free filter
Крок 7. Confirm: показати breakdown (опції, ціна, тривалість) + createBooking

для розгортань на сервері https://pm2.keymetrics.io/docs/usage/process-management/
