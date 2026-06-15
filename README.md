# Finance Tracker

Це проєкт для керування особистими фінансами з бекендом на NestJS і фронтендом на React + Vite.

## Структура проєкту

- `backend/` — NestJS API, PostgreSQL + TypeORM, JWT-аутентифікація, модулі для транзакцій, бюджетів, боргів, цілей та регулярних операцій.
- `frontend/` — React + TypeScript + Vite, Tailwind, Zustand, форми та моніторинг фінансових даних.

## Локальний запуск

### 1. Налаштування бекенду

1. Перейдіть до папки бекенду:

```bash
cd backend
```

2. Встановіть залежності:

```bash
npm install
```

3. Створіть файл `.env` у папці `backend/` з такими змінними:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_NAME=finance_tracker
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=30d
PORT=3001
```

4. Запустіть сервер у режимі розробки:

```bash
npm run start:dev
```

Бекенд буде працювати за адресою `http://localhost:3001`.

### 2. Налаштування фронтенду

1. Перейдіть до папки фронтенду:

```bash
cd ../frontend
```

2. Встановіть залежності:

```bash
npm install
```

3. Створіть файл `.env` або `.env.local` у папці `frontend/` з таким налаштуванням:

```env
VITE_API_BASE=http://localhost:3001
```

4. Запустіть фронтенд:

```bash
npm run dev
```

Фронтенд буде доступний за адресою, яку покаже Vite, зазвичай `http://localhost:5173`.

## Команди

### Бекенд

- `npm run start:dev` — запуск у режимі розробки.
- `npm run start:prod` — запуск зібраного додатку.
- `npm run build` — збірка проекту.
- `npm run lint` — перевірка ESLint.
- `npm run test` — запуск Jest тестів.

### Фронтенд

- `npm run dev` — запуск Vite у режимі розробки.
- `npm run build` — збірка статичного додатку.
- `npm run preview` — перегляд зібраного додатку.
- `npm run lint` — перевірка ESLint.

## Переміщення в production

Для продакшн-запуску бекенд-компоненту з `backend/`:

```bash
cd backend
npm install
npm run build
npm run start:prod
```

Для продакшн-запуску фронтенду з `frontend/`:

```bash
cd frontend
npm install
npm run build
```

Публікуйте вміст `frontend/dist` як статичний сайт.

## Деплой на Render

Цей проєкт найкраще розгорнути як два сервісу:

1. Web Service для `backend/`
2. Static Site для `frontend/`

### Backend на Render

- Тип сервісу: `Web Service`
- Root Directory: `backend`
- Build Command: `npm install && npm run build`
- Start Command: `npm run start:prod`
- Environment:
  - `DB_HOST` — хост PostgreSQL
  - `DB_PORT` — порт PostgreSQL (наприклад, `5432`)
  - `DB_USERNAME` — користувач бази даних
  - `DB_PASSWORD` — пароль
  - `DB_NAME` — назва бази даних
  - `JWT_SECRET` — секрет для JWT
  - `JWT_EXPIRES_IN` — термін життя токена (наприклад, `30d`)
  - `PORT` — зазвичай Render задає автоматично, але можна вказати `3001`

> Якщо база даних на Render, встановіть SSL та доступ через зовнішній хост. Бекенд вже налаштований на `ssl.rejectUnauthorized=false`.

### Frontend на Render

- Тип сервісу: `Static Site`
- Root Directory: `frontend`
- Build Command: `npm install && npm run build`
- Publish Directory: `dist`
- Environment:
  - `VITE_API_BASE` — URL бекенд-сервісу, наприклад `https://my-backend.onrender.com`

### Додаткові кроки

1. Підключіть репозиторій до Render.
2. Створіть окремий Web Service для `backend` з кореневою директорією `backend`.
3. Створіть окремий Static Site для `frontend` з кореневою директорією `frontend`.
4. Налаштуйте DNS / CNAME, якщо потрібно.
5. Перевірте, що фронтенд підключається до бекенду через `VITE_API_BASE`.

## Поради

- Використовуйте окрему базу даних Postgres для deployment.
- Для оточень production і staging зберігайте `JWT_SECRET` у Render Environment Variables.
- Якщо під час деплою фронтенду виникають помилки, перевірте значення `VITE_API_BASE`.
- Для дебагу бекенду заходьте в Render лог сервісу.

---

Якщо потрібно, можу додати приклади `render.yaml` для автоматичного деплою або уточнити налаштування для `postgres` на Render.
