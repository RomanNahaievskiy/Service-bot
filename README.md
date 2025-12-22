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
