# CampusHub — REST API університетських подій (ПР6)

Ресурсно-орієнтований API для подій, категорій і реєстрацій учасників.
Дані зберігаються в пам'яті (`Map`), після перезапуску зникають. Залежностей немає — лише Node.js ≥ 18.

## Запуск

```bash
npm start          # http://localhost:3000 (порт: змінна PORT)
npm test           # автоматичні тести (node:test)
```

## Ресурси

| Ресурс | Поля |
|---|---|
| `events` | `id`, `title`, `description`, `categoryId`, `createdAt`, `updatedAt` |
| `categories` | `id`, `name` |
| `registrations` | `id`, `eventId`, `participantId`, `createdAt` |

Категорія → багато подій; подія → багато реєстрацій; пара `eventId + participantId` унікальна.
Повна карта: [docs/resource-map.md](docs/resource-map.md).

## Маршрути

| Маршрут | Успіх | Помилки |
|---|---|---|
| `POST /events` | 201 + `Location` | 400 |
| `GET /events` | 200 | — |
| `GET /events/:id` | 200 | 404 |
| `PATCH /events/:id` | 200 | 400, 404 |
| `DELETE /events/:id` | 204 (без тіла) | 404 |
| `POST /events/:id/registrations` | 201 + `Location` | 400, 404, 409 |

Додатково: `GET /categories`, `GET /events/:id/registrations`, `GET /events/:id/registrations/:regId`.

## Правила

- `title` і `categoryId` — обов'язкові, `description` — ні; перевіряється на сервері.
- Сервер сам генерує `id` (UUID), `createdAt`, `updatedAt`; клієнт їх змінювати не може (`400`).
- Невідомий `categoryId` → `400`.
- `PATCH` змінює лише передані поля, оновлює `updatedAt`.
- **Видалення події каскадно видаляє її реєстрації.**

Приклади запитів і відповідей: [docs/api-examples.md](docs/api-examples.md).

## Здача

```bash
git init && git add . && git commit -m "ПР6: REST-ресурси CampusHub"
git tag pr-06
git push origin <назва-гілки>
git push origin pr-06
```
