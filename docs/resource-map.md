# CampusHub resource map

| Resource | Purpose | Fields |
|---|---|---|
| `events` | University lectures, meetings, and workshops | `id`, `title`, `description`, `categoryId`, `createdAt`, `updatedAt` |
| `categories` | Event categories | `id`, `name` |
| `registrations` | A participant's registration for an event | `id`, `eventId`, `participantId`, `createdAt` |

Relationships:

- One category has many events; each event belongs to one category.
- One event has many registrations; each registration refers to one event and one participant.
- A participant can register for multiple events, but only once for each event.
- Deleting an event also deletes all its registrations (cascade delete).

Categories are seeded in memory and exposed read-only through `GET /categories`. Event and registration data are also stored in memory and reset when the application restarts.
