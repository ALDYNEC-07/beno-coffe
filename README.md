## BENO COFFEE

Маркетинговый сайт кофейни с полным меню, страницей позиции и картой.
Проект использует Next.js App Router и получает данные меню через внутренний API.

## Getting Started

Установите зависимости и запустите dev-сервер:

```bash
npm install
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000).

## Pages

- `/` — главная страница с секциями и полным меню под заголовком.
- `/menu/[id]` — страница одной позиции.
- `/map` — контакты и карта.

## Menu API

Серверный эндпоинт: `GET /api/menu-with-variants`.
Он читает данные из Baserow и возвращает позиции вместе с вариантами.

Нужные переменные окружения:

- `BASEROW_API_URL`
- `BASEROW_TABLE_ID`
- `BASEROW_VARIANTS_TABLE_ID`
- `BASEROW_SIZES_TABLE_ID`
- `BASEROW_TOKEN`

## Scripts

- `npm run dev` — локальная разработка
- `npm run build` — сборка
- `npm run start` — запуск сборки
- `npm run lint` — ESLint
- `npm run test` — Jest
