# Приклади API CampusHub

Базова адреса: `http://localhost:3000`. Усі тіла — `application/json`.
UUID у прикладах умовні; під час перевірки використовуйте ті, що повертає сервер.

Формат помилки:

```json
{ "error": { "code": "VALIDATION_ERROR", "message": "Некоректні дані запиту", "details": [ { "field": "title", "message": "Обов’язкове поле" } ] } }
```

## 1. Створення події — 201

```http
POST /events
Content-Type: application/json

{ "title": "Лекція з REST", "description": "Вступ до ресурсів", "categoryId": "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1" }
```

```http
HTTP/1.1 201 Created
Location: /events/550e8400-e29b-41d4-a716-446655440000
Content-Type: application/json; charset=utf-8

{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Лекція з REST",
  "categoryId": "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1",
  "createdAt": "2026-10-07T06:00:00.000Z",
  "updatedAt": "2026-10-07T06:00:00.000Z",
  "description": "Вступ до ресурсів"
}
```

## 2. Список подій — 200

```http
GET /events
```
```http
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8

[ { "id": "550e8400-e29b-41d4-a716-446655440000", "title": "Лекція з REST", "...": "..." } ]
```

## 3. Одна подія — 200

```http
GET /events/550e8400-e29b-41d4-a716-446655440000
```
Відповідь `200 OK` — об'єкт події (як у п. 1).

## 4. Часткове оновлення — 200

```http
PATCH /events/550e8400-e29b-41d4-a716-446655440000
Content-Type: application/json

{ "title": "Лекція з REST API" }
```
```http
HTTP/1.1 200 OK

{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Лекція з REST API",
  "categoryId": "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1",
  "createdAt": "2026-10-07T06:00:00.000Z",
  "updatedAt": "2026-10-07T06:03:00.000Z",
  "description": "Вступ до ресурсів"
}
```
`description` збережено, `id` і `createdAt` не змінились, `updatedAt` оновлено.

## 5. Реєстрація учасника — 201

```http
POST /events/550e8400-e29b-41d4-a716-446655440000/registrations
Content-Type: application/json

{ "participantId": "22222222-2222-4222-8222-222222222222" }
```
```http
HTTP/1.1 201 Created
Location: /events/550e8400-e29b-41d4-a716-446655440000/registrations/33333333-3333-4333-8333-333333333333
Content-Type: application/json; charset=utf-8

{
  "id": "33333333-3333-4333-8333-333333333333",
  "eventId": "550e8400-e29b-41d4-a716-446655440000",
  "participantId": "22222222-2222-4222-8222-222222222222",
  "createdAt": "2026-10-07T06:05:00.000Z"
}
```

## 6. Видалення — 204

```http
DELETE /events/550e8400-e29b-41d4-a716-446655440000
```
```http
HTTP/1.1 204 No Content
```
Тіла немає. Разом із подією видаляються її реєстрації. Наступний `GET` повертає `404`.

## Помилки

### 400 Bad Request — немає `title`
```http
POST /events
{ "categoryId": "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1" }
```
```http
HTTP/1.1 400 Bad Request

{ "error": { "code": "VALIDATION_ERROR", "message": "Некоректні дані запиту", "details": [ { "field": "title", "message": "Обов’язкове поле" } ] } }
```

### 400 — невідомий `categoryId`
```http
POST /events
{ "title": "X", "categoryId": "00000000-0000-4000-8000-000000000000" }
```
Відповідь `400`, `details`: `categoryId` — «Категорії з таким id не існує».

### 400 — спроба змінити службове поле
```http
PATCH /events/550e8400-e29b-41d4-a716-446655440000
{ "id": "hack" }
```
Відповідь `400`, `details`: `id` — «Службове поле не можна змінювати».

### 400 — реєстрація без `participantId`
```http
POST /events/550e8400-e29b-41d4-a716-446655440000/registrations
{}
```
Відповідь `400`, `details`: `participantId` — обов'язкове поле.

### 404 Not Found — події немає
```http
GET /events/00000000-0000-4000-8000-000000000000
```
```http
HTTP/1.1 404 Not Found

{ "error": { "code": "NOT_FOUND", "message": "Подію не знайдено" } }
```
Те саме для `PATCH`, `DELETE`, а також для `POST /events/:id/registrations` з неіснуючою подією.

### 409 Conflict — дубльована реєстрація
```http
POST /events/550e8400-e29b-41d4-a716-446655440000/registrations
{ "participantId": "22222222-2222-4222-8222-222222222222" }
```
```http
HTTP/1.1 409 Conflict

{ "error": { "code": "CONFLICT", "message": "Учасник уже зареєстрований на цю подію" } }
```
У сховищі лишається один запис.

### 405 Method Not Allowed
`PUT /events` → `405` із заголовком `Allow: GET, POST`.

## Порядок перевірок у `POST /events/:id/registrations`

1. Тіло та `participantId` коректні? Ні → `400`.
2. Подія існує? Ні → `404`.
3. Пара `eventId + participantId` уже є? Так → `409`.
4. Генеруємо UUID, `createdAt`, зберігаємо → `201` + `Location`.

## Перевірка через curl

```bash
BASE=http://localhost:3000
CAT=aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1

curl -i -X POST $BASE/events -H 'Content-Type: application/json' \
  -d "{\"title\":\"Лекція з REST\",\"categoryId\":\"$CAT\"}"
# підставте id з відповіді:
ID=<id>
curl -i $BASE/events
curl -i $BASE/events/$ID
curl -i -X PATCH $BASE/events/$ID -H 'Content-Type: application/json' -d '{"title":"Нова назва"}'
curl -i -X POST $BASE/events/$ID/registrations -H 'Content-Type: application/json' \
  -d '{"participantId":"22222222-2222-4222-8222-222222222222"}'
curl -i -X POST $BASE/events/$ID/registrations -H 'Content-Type: application/json' \
  -d '{"participantId":"22222222-2222-4222-8222-222222222222"}'   # 409
curl -i -X DELETE $BASE/events/$ID    # 204
curl -i $BASE/events/$ID              # 404
```
