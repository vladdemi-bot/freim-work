'use strict';
const http = require('node:http');
const { createStore } = require('./store');

const MAX_BODY = 1024 * 1024; // 1 МБ

class HttpError extends Error {
  constructor(status, code, message, details) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

function send(res, status, body, headers = {}) {
  if (body === undefined) {
    res.writeHead(status, headers);
    return res.end(); // без тіла (204)
  }
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(payload),
    ...headers,
  });
  res.end(payload);
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on('data', (c) => {
      size += c.length;
      if (size > MAX_BODY) {
        reject(new HttpError(413, 'PAYLOAD_TOO_LARGE', 'Тіло запиту занадто велике'));
        req.destroy();
        return;
      }
      chunks.push(c);
    });
    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf8');
      if (raw.trim() === '') return reject(new HttpError(400, 'BAD_REQUEST', 'Тіло запиту порожнє'));
      try {
        const data = JSON.parse(raw);
        if (data === null || typeof data !== 'object' || Array.isArray(data)) {
          return reject(new HttpError(400, 'BAD_REQUEST', 'Тіло запиту має бути JSON-об’єктом'));
        }
        resolve(data);
      } catch {
        reject(new HttpError(400, 'BAD_REQUEST', 'Некоректний JSON'));
      }
    });
    req.on('error', reject);
  });
}

const isNonEmptyString = (v, max) => typeof v === 'string' && v.trim().length > 0 && v.length <= max;

function createApp(store = createStore()) {
  const EVENT_FIELDS = new Set(['title', 'description', 'categoryId']);
  const SERVICE_FIELDS = new Set(['id', 'createdAt', 'updatedAt']);

  /** Перевіряє тіло події. partial=true — для PATCH. Повертає очищений об'єкт або кидає 400. */
  function validateEvent(body, partial) {
    const errors = [];
    const out = {};

    for (const k of Object.keys(body)) {
      if (SERVICE_FIELDS.has(k)) errors.push({ field: k, message: 'Службове поле не можна змінювати' });
      else if (!EVENT_FIELDS.has(k)) errors.push({ field: k, message: 'Невідоме поле' });
    }

    if ('title' in body) {
      if (!isNonEmptyString(body.title, 200)) errors.push({ field: 'title', message: 'Має бути непорожнім рядком до 200 символів' });
      else out.title = body.title.trim();
    } else if (!partial) errors.push({ field: 'title', message: 'Обов’язкове поле' });

    if ('description' in body) {
      if (body.description !== null && (typeof body.description !== 'string' || body.description.length > 2000)) {
        errors.push({ field: 'description', message: 'Має бути рядком до 2000 символів або null' });
      } else out.description = body.description;
    }

    if ('categoryId' in body) {
      if (typeof body.categoryId !== 'string' || !store.hasCategory(body.categoryId)) {
        errors.push({ field: 'categoryId', message: 'Категорії з таким id не існує' });
      } else out.categoryId = body.categoryId;
    } else if (!partial) errors.push({ field: 'categoryId', message: 'Обов’язкове поле' });

    if (partial && errors.length === 0 && Object.keys(out).length === 0) {
      errors.push({ message: 'Передайте хоча б одне поле для оновлення' });
    }
    if (errors.length) throw new HttpError(400, 'VALIDATION_ERROR', 'Некоректні дані запиту', errors);
    return out;
  }

  const getEventOr404 = (id) => {
    const event = store.getEvent(id);
    if (!event) throw new HttpError(404, 'NOT_FOUND', 'Подію не знайдено');
    return event;
  };

  // --- маршрути ---
  const routes = [
    ['GET', '/categories', async (req, res) => send(res, 200, store.listCategories())],

    ['POST', '/events', async (req, res) => {
      const data = validateEvent(await readJson(req), false);
      const event = store.createEvent(data);
      send(res, 201, event, { Location: `/events/${event.id}` });
    }],
    ['GET', '/events', async (req, res) => send(res, 200, store.listEvents())],
    ['GET', '/events/:id', async (req, res, { id }) => send(res, 200, getEventOr404(id))],
    ['PATCH', '/events/:id', async (req, res, { id }) => {
      getEventOr404(id);
      const patch = validateEvent(await readJson(req), true);
      send(res, 200, store.updateEvent(id, patch));
    }],
    ['DELETE', '/events/:id', async (req, res, { id }) => {
      getEventOr404(id);
      store.deleteEvent(id);
      send(res, 204);
    }],

    ['POST', '/events/:id/registrations', async (req, res, { id }) => {
      const body = await readJson(req);                       // 1. формат → 400
      if (!isNonEmptyString(body.participantId, 100)) {
        throw new HttpError(400, 'VALIDATION_ERROR', 'Некоректні дані запиту', [
          { field: 'participantId', message: 'Обов’язкове поле: непорожній рядок до 100 символів' },
        ]);
      }
      getEventOr404(id);                                      // 2. подія існує → 404
      if (store.hasRegistration(id, body.participantId)) {    // 3. дубль → 409
        throw new HttpError(409, 'CONFLICT', 'Учасник уже зареєстрований на цю подію');
      }
      const reg = store.createRegistration(id, body.participantId); // 4. створення
      send(res, 201, reg, { Location: `/events/${id}/registrations/${reg.id}` });
    }],
    ['GET', '/events/:id/registrations', async (req, res, { id }) => {
      getEventOr404(id);
      send(res, 200, store.listRegistrations(id));
    }],
    ['GET', '/events/:id/registrations/:regId', async (req, res, { id, regId }) => {
      getEventOr404(id);
      const reg = store.getRegistration(regId);
      if (!reg || reg.eventId !== id) throw new HttpError(404, 'NOT_FOUND', 'Реєстрацію не знайдено');
      send(res, 200, reg);
    }],
  ].map(([method, path, handler]) => {
    const names = [];
    const regex = new RegExp('^' + path.replace(/:([a-zA-Z]+)/g, (_, n) => (names.push(n), '([^/]+)')) + '/?$');
    return { method, regex, names, handler };
  });

  async function handle(req, res) {
    const { pathname } = new URL(req.url, 'http://localhost');
    const matched = routes.filter((r) => r.regex.test(pathname));
    if (matched.length === 0) throw new HttpError(404, 'NOT_FOUND', 'Маршрут не знайдено');

    const route = matched.find((r) => r.method === req.method);
    if (!route) {
      const allow = [...new Set(matched.map((r) => r.method))].join(', ');
      throw Object.assign(new HttpError(405, 'METHOD_NOT_ALLOWED', 'Метод не підтримується'), { headers: { Allow: allow } });
    }
    const m = route.regex.exec(pathname);
    const params = {};
    route.names.forEach((n, i) => (params[n] = decodeURIComponent(m[i + 1])));
    await route.handler(req, res, params);
  }

  return http.createServer((req, res) => {
    handle(req, res).catch((err) => {
      if (res.headersSent) return;
      if (err instanceof HttpError) {
        const error = { code: err.code, message: err.message };
        if (err.details) error.details = err.details;
        return send(res, err.status, { error }, err.headers);
      }
      console.error(err);
      send(res, 500, { error: { code: 'INTERNAL_ERROR', message: 'Внутрішня помилка сервера' } });
    });
  });
}

module.exports = { createApp };
