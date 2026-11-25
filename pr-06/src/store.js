'use strict';
const { randomUUID } = require('node:crypto');

/** Сховище в пам'яті. Після перезапуску сервера дані зникають. */
function createStore() {
  const categories = new Map();
  const events = new Map();
  const registrations = new Map();
  const registrationKeys = new Set(); // "eventId:participantId" — захист від дублів

  const seed = [
    ['aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1', 'Лекція'],
    ['aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2', 'Майстер-клас'],
    ['aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa3', 'Зустріч'],
  ];
  for (const [id, name] of seed) categories.set(id, { id, name });

  const key = (eventId, participantId) => `${eventId}:${participantId}`;

  return {
    // categories
    listCategories: () => [...categories.values()],
    hasCategory: (id) => categories.has(id),

    // events
    listEvents: () => [...events.values()],
    getEvent: (id) => events.get(id),
    createEvent({ title, description, categoryId }) {
      const now = new Date().toISOString();
      const event = { id: randomUUID(), title, categoryId, createdAt: now, updatedAt: now };
      if (description !== undefined) event.description = description;
      events.set(event.id, event);
      return event;
    },
    updateEvent(id, patch) {
      const event = events.get(id);
      if (!event) return undefined;
      Object.assign(event, patch, { updatedAt: new Date().toISOString() });
      return event;
    },
    deleteEvent(id) {
      if (!events.delete(id)) return false;
      // каскадне видалення реєстрацій події
      for (const [regId, reg] of registrations) {
        if (reg.eventId === id) {
          registrations.delete(regId);
          registrationKeys.delete(key(reg.eventId, reg.participantId));
        }
      }
      return true;
    },

    // registrations
    hasRegistration: (eventId, participantId) => registrationKeys.has(key(eventId, participantId)),
    createRegistration(eventId, participantId) {
      const reg = { id: randomUUID(), eventId, participantId, createdAt: new Date().toISOString() };
      registrations.set(reg.id, reg);
      registrationKeys.add(key(eventId, participantId));
      return reg;
    },
    getRegistration: (id) => registrations.get(id),
    listRegistrations: (eventId) => [...registrations.values()].filter((r) => r.eventId === eventId),
  };
}

module.exports = { createStore };
