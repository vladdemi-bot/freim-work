# Ресурсна карта CampusHub

## Ресурси

| Ресурс | Призначення | Поля |
|---|---|---|
| `events` | Події: лекції, зустрічі, майстер-класи | `id`, `title`, `description`, `categoryId`, `createdAt`, `updatedAt` |
| `categories` | Категорії подій | `id`, `name` |
| `registrations` | Реєстрації учасників на події | `id`, `eventId`, `participantId`, `createdAt` |

`participantId` — лише ідентифікатор учасника (непорожній рядок до 100 символів). Окремого API для учасників немає.

## Зв'язки

- Одна категорія містить багато подій; кожна подія належить рівно одній категорії (`events.categoryId → categories.id`).
- Одна подія має багато реєстрацій (`registrations.eventId → events.id`).
- Кожна реєстрація пов'язує одного учасника з однією подією; один учасник може бути зареєстрований на кілька різних подій.
- Пара `eventId + participantId` унікальна: повторна реєстрація → `409 Conflict`.

```
categories 1 ──── * events 1 ──── * registrations * ──── 1 participant (лише participantId)
```

## Правила полів події

| Поле | Обов'язкове | Правило |
|---|---|---|
| `title` | так | непорожній рядок, до 200 символів |
| `description` | ні | рядок до 2000 символів або `null` |
| `categoryId` | так | id існуючої категорії, інакше `400` |
| `id`, `createdAt`, `updatedAt` | — | службові; генерує сервер, клієнт їх не передає (інакше `400`) |

## Поведінка при видаленні

Видалення події **каскадно видаляє всі її реєстрації**, щоб не залишалось записів із посиланням на неіснуючу подію. Пара `eventId + participantId` після цього знову вільна.

## Маршрути

| Метод і маршрут | Дія | Успіх |
|---|---|---|
| `POST /events` | Створити подію | `201` + `Location` |
| `GET /events` | Список подій | `200` |
| `GET /events/:id` | Одна подія | `200` |
| `PATCH /events/:id` | Оновити окремі поля | `200` |
| `DELETE /events/:id` | Видалити подію (і її реєстрації) | `204` без тіла |
| `POST /events/:id/registrations` | Зареєструвати учасника | `201` + `Location` |
| `GET /events/:id/registrations` | Реєстрації події (додатково) | `200` |
| `GET /events/:id/registrations/:regId` | Одна реєстрація (адреса з `Location`) | `200` |
| `GET /categories` | Список категорій (додатково) | `200` |

Категорії підготовлені в пам'яті:

| id | name |
|---|---|
| `aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1` | Лекція |
| `aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2` | Майстер-клас |
| `aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa3` | Зустріч |
