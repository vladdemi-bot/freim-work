# CampusHub API examples

Start the server with `npm run start`. Every ID shown below is a UUID. Category UUIDs are seeded by the app; list them with `GET http://localhost:3000/categories`.

## List categories

```http
GET /categories HTTP/1.1
Host: localhost:3000
```

```http
HTTP/1.1 200 OK
Content-Type: application/json
X-Request-Id: 65f14e55-58da-4304-b4d6-cd52a7db3a70
```

```json
[
  { "id": "11111111-1111-4111-8111-111111111111", "name": "Academic" },
  { "id": "22222222-2222-4222-8222-222222222222", "name": "Culture" },
  { "id": "33333333-3333-4333-8333-333333333333", "name": "Workshops" }
]
```

## Create an event

`title` and `categoryId` are required. `description` is optional. `title` is trimmed and must contain 3–100 characters; `description` is trimmed and may contain up to 500 characters. Unknown fields, invalid UUIDs, and unknown categories are rejected with 400.

```http
POST /events HTTP/1.1
Host: localhost:3000
Content-Type: application/json

{
  "title": "Node.js Workshop",
  "description": "Introductory campus workshop.",
  "categoryId": "33333333-3333-4333-8333-333333333333"
}
```

```http
HTTP/1.1 201 Created
Location: /events/550e8400-e29b-41d4-a716-446655440000
Content-Type: application/json
X-Request-Id: 65f14e55-58da-4304-b4d6-cd52a7db3a70
```

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Node.js Workshop",
  "description": "Introductory campus workshop.",
  "categoryId": "33333333-3333-4333-8333-333333333333",
  "createdAt": "2026-11-04T10:00:00.000Z",
  "updatedAt": "2026-11-04T10:00:00.000Z"
}
```

## Read and update an event

```http
GET /events/550e8400-e29b-41d4-a716-446655440000 HTTP/1.1
Host: localhost:3000
```

Returns `200 OK` and the event representation. `GET /events` returns all events.

```http
PATCH /events/550e8400-e29b-41d4-a716-446655440000 HTTP/1.1
Host: localhost:3000
Content-Type: application/json

{ "title": "Advanced Node.js Workshop" }
```

Returns `200 OK`. Only supplied fields change; `id` and `createdAt` stay the same and `updatedAt` receives the current time. An empty patch returns 400.

## Register a participant

```http
POST /events/550e8400-e29b-41d4-a716-446655440000/registrations HTTP/1.1
Host: localhost:3000
Content-Type: application/json

{ "participantId": "22222222-2222-4222-8222-222222222222" }
```

```http
HTTP/1.1 201 Created
Location: /events/550e8400-e29b-41d4-a716-446655440000/registrations/33333333-3333-4333-8333-333333333333
Content-Type: application/json
X-Request-Id: 65f14e55-58da-4304-b4d6-cd52a7db3a70
```

```json
{
  "id": "33333333-3333-4333-8333-333333333333",
  "eventId": "550e8400-e29b-41d4-a716-446655440000",
  "participantId": "22222222-2222-4222-8222-222222222222",
  "createdAt": "2026-11-04T10:05:00.000Z"
}
```

The event must exist (otherwise 404), `participantId` must be a UUID (otherwise 400), and a duplicate event/participant pair returns 409.

## Delete an event

```http
DELETE /events/550e8400-e29b-41d4-a716-446655440000 HTTP/1.1
Host: localhost:3000
```

Returns `204 No Content` with no body. Related registrations are removed too. A subsequent GET for the event returns 404.

## Problem Details errors

All errors use `Content-Type: application/problem+json` and include `type`, `title`, `status`, `detail`, `instance`, `code`, and `requestId`.

### 400 Bad Request

```json
{
  "type": "https://example.com/problems/validation-error",
  "title": "Request validation failed",
  "status": 400,
  "detail": "Request validation failed",
  "instance": "/events",
  "code": "VALIDATION_ERROR",
  "requestId": "65f14e55-58da-4304-b4d6-cd52a7db3a70",
  "errors": [{ "field": "title", "message": "Title must contain at least 3 characters" }]
}
```

### 404 Not Found

```json
{
  "type": "https://example.com/problems/event-not-found",
  "title": "Event not found",
  "status": 404,
  "detail": "Event with id 550e8400-e29b-41d4-a716-446655440000 was not found",
  "instance": "/events/550e8400-e29b-41d4-a716-446655440000",
  "code": "EVENT_NOT_FOUND",
  "requestId": "65f14e55-58da-4304-b4d6-cd52a7db3a70"
}
```

### 409 Conflict

```json
{
  "type": "https://example.com/problems/registration-already-exists",
  "title": "Participant already registered",
  "status": 409,
  "detail": "Participant is already registered for this event",
  "instance": "/events/550e8400-e29b-41d4-a716-446655440000/registrations",
  "code": "REGISTRATION_ALREADY_EXISTS",
  "requestId": "65f14e55-58da-4304-b4d6-cd52a7db3a70"
}
```

