# freim-work

## Projects CRUD API

This NestJS vertical slice exposes endpoints to create, list, retrieve, update, and delete projects. Project records are currently stored in memory and reset when the server restarts.

### Dependency graph

```mermaid
graph TD
  HTTP[HTTP request] --> Controller[ProjectsController]
  Controller --> Service[ProjectsService]
  Service --> Port[ProjectsRepository port]
  Adapter[InMemoryProjectsRepository] -. implements .-> Port
  Module[ProjectsModule / DI] -. wires .-> Controller
  Module -. wires .-> Service
  Module -. binds repository token .-> Adapter
```

The controller maps HTTP requests to service calls. The service handles application behavior and relies on the repository port for data access. The module binds that port to its in-memory adapter through dependency injection.

### Routes

| Method | Path | Operation |
|---|---|---|
| `POST` | `/projects` | Create a project |
| `GET` | `/projects` | List projects |
| `GET` | `/projects/:id` | Retrieve one project |
| `PATCH` | `/projects/:id` | Update a project |
| `DELETE` | `/projects/:id` | Remove a project |

`POST /projects` accepts a required `name` (3–100 characters) and `status` (`draft`, `active`, or `completed`), plus an optional `description` (up to 500 characters). `PATCH /projects/:id` accepts any subset of those fields with the same validation rules. Unknown properties and non-numeric IDs are rejected with `400 Bad Request`.

Responses use `ProjectResponseDto`, which exposes only `id`, `name`, `description`, `status`, and `createdAt`. Errors share this shape:

```json
{
  "statusCode": 404,
  "errorCode": "PROJECT_NOT_FOUND",
  "message": "Project with id 10 was not found",
  "path": "/projects/10",
  "timestamp": "2026-09-23T10:00:00.000Z",
  "traceId": "550e8400-e29b-41d4-a716-446655440000"
}
```

Send an `x-trace-id` header to include a caller-provided trace ID; otherwise the API generates one.

### Run locally

```powershell
npm install
npm run build
npm run start
```
