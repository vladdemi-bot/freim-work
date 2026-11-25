'use strict';
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { createApp } = require('../src/app');

const CATEGORY = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1';
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
let server, base;

before(async () => {
  server = createApp();
  await new Promise((r) => server.listen(0, r));
  base = `http://localhost:${server.address().port}`;
});
after(() => server.close());

const call = (method, path, body) =>
  fetch(base + path, {
    method,
    headers: body !== undefined ? { 'Content-Type': 'application/json' } : {},
    body: body !== undefined ? (typeof body === 'string' ? body : JSON.stringify(body)) : undefined,
  });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

test('CRUD подій', async () => {
  let res = await call('POST', '/events', { title: 'Лекція з REST', description: 'Вступ', categoryId: CATEGORY });
  assert.equal(res.status, 201);
  const event = await res.json();
  assert.match(event.id, UUID);
  assert.equal(res.headers.get('location'), `/events/${event.id}`);
  assert.equal(event.createdAt, event.updatedAt);

  res = await call('GET', '/events');
  assert.equal(res.status, 200);
  assert.ok((await res.json()).some((e) => e.id === event.id));

  res = await call('GET', `/events/${event.id}`);
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), event);

  await sleep(5);
  res = await call('PATCH', `/events/${event.id}`, { title: 'Нова назва' });
  assert.equal(res.status, 200);
  const updated = await res.json();
  assert.equal(updated.title, 'Нова назва');
  assert.equal(updated.description, 'Вступ'); // інші поля збережено
  assert.equal(updated.id, event.id);
  assert.equal(updated.createdAt, event.createdAt);
  assert.notEqual(updated.updatedAt, event.updatedAt);

  res = await call('DELETE', `/events/${event.id}`);
  assert.equal(res.status, 204);
  assert.equal(await res.text(), '');
  assert.equal((await call('GET', `/events/${event.id}`)).status, 404);
  assert.equal((await call('DELETE', `/events/${event.id}`)).status, 404);
  assert.equal((await call('PATCH', `/events/${event.id}`, { title: 'x' })).status, 404);
});

test('валідація подій → 400', async () => {
  assert.equal((await call('POST', '/events', { categoryId: CATEGORY })).status, 400);
  assert.equal((await call('POST', '/events', { title: '  ', categoryId: CATEGORY })).status, 400);
  assert.equal((await call('POST', '/events', { title: 'X' })).status, 400);
  assert.equal((await call('POST', '/events', { title: 'X', categoryId: 'unknown' })).status, 400);
  assert.equal((await call('POST', '/events', '{broken')).status, 400);
  assert.equal((await call('POST', '/events', [1, 2])).status, 400);

  const { id } = await (await call('POST', '/events', { title: 'X', categoryId: CATEGORY })).json();
  assert.equal((await call('PATCH', `/events/${id}`, { id: 'hack' })).status, 400);
  assert.equal((await call('PATCH', `/events/${id}`, { createdAt: '2000-01-01' })).status, 400);
  assert.equal((await call('PATCH', `/events/${id}`, {})).status, 400);
  assert.equal((await call('PATCH', `/events/${id}`, { categoryId: 'nope' })).status, 400);
  assert.equal((await call('PATCH', `/events/${id}`, { title: '' })).status, 400);
});

test('реєстрації', async () => {
  const { id } = await (await call('POST', '/events', { title: 'Майстер-клас', categoryId: CATEGORY })).json();
  const body = { participantId: '22222222-2222-4222-8222-222222222222' };

  let res = await call('POST', `/events/${id}/registrations`, body);
  assert.equal(res.status, 201);
  const reg = await res.json();
  assert.match(reg.id, UUID);
  assert.equal(reg.eventId, id);
  assert.equal(reg.participantId, body.participantId);
  const location = res.headers.get('location');
  assert.equal(location, `/events/${id}/registrations/${reg.id}`);
  assert.equal((await call('GET', location)).status, 200);

  assert.equal((await call('POST', `/events/${id}/registrations`, body)).status, 409);
  assert.equal((await (await call('GET', `/events/${id}/registrations`)).json()).length, 1);

  const other = await (await call('POST', '/events', { title: 'Інша', categoryId: CATEGORY })).json();
  assert.equal((await call('POST', `/events/${other.id}/registrations`, body)).status, 201);

  assert.equal((await call('POST', '/events/00000000-0000-4000-8000-000000000000/registrations', body)).status, 404);
  assert.equal((await call('POST', `/events/${id}/registrations`, {})).status, 400);
  assert.equal((await call('POST', `/events/${id}/registrations`, { participantId: 5 })).status, 400);

  // видалення події каскадно видаляє реєстрації
  assert.equal((await call('DELETE', `/events/${id}`)).status, 204);
  assert.equal((await call('GET', location)).status, 404);
});

test('службові відповіді', async () => {
  assert.equal((await call('GET', '/nothing')).status, 404);
  const res = await call('PUT', '/events');
  assert.equal(res.status, 405);
  assert.match(res.headers.get('allow'), /GET/);
  assert.equal((await (await call('GET', '/categories')).json()).length, 3);
});
