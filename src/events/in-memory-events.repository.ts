import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { Category, CreateEventInput, Event, Registration, UpdateEventInput } from './event';
import { EventsRepository } from './events.repository';

export const SEED_CATEGORIES: readonly Category[] = [
  { id: '11111111-1111-4111-8111-111111111111', name: 'Academic' },
  { id: '22222222-2222-4222-8222-222222222222', name: 'Culture' },
  { id: '33333333-3333-4333-8333-333333333333', name: 'Workshops' },
];

@Injectable()
export class InMemoryEventsRepository implements EventsRepository {
  private readonly categories = new Map(SEED_CATEGORIES.map((category) => [category.id, category]));
  private readonly events = new Map<string, Event>();
  private readonly registrations = new Map<string, Registration>();

  async findAllCategories(): Promise<Category[]> {
    return [...this.categories.values()].map((category) => ({ ...category }));
  }

  async categoryExists(id: string): Promise<boolean> {
    return this.categories.has(id);
  }

  async createEvent(input: CreateEventInput): Promise<Event> {
    const now = new Date();
    const event: Event = {
      ...input,
      id: randomUUID(),
      createdAt: now,
      updatedAt: now,
    };
    this.events.set(event.id, event);
    return { ...event };
  }

  async findAllEvents(): Promise<Event[]> {
    return [...this.events.values()].map((event) => ({ ...event }));
  }

  async findEvent(id: string): Promise<Event | null> {
    const event = this.events.get(id);
    return event ? { ...event } : null;
  }

  async updateEvent(id: string, input: UpdateEventInput): Promise<Event | null> {
    const current = this.events.get(id);
    if (!current) return null;
    const updated: Event = { ...current, ...input, id, updatedAt: new Date() };
    this.events.set(id, updated);
    return { ...updated };
  }

  async deleteEvent(id: string): Promise<boolean> {
    if (!this.events.delete(id)) return false;
    for (const [registrationId, registration] of this.registrations) {
      if (registration.eventId === id) this.registrations.delete(registrationId);
    }
    return true;
  }

  async findRegistration(eventId: string, participantId: string): Promise<Registration | null> {
    const registration = [...this.registrations.values()].find(
      (item) => item.eventId === eventId && item.participantId === participantId,
    );
    return registration ? { ...registration } : null;
  }

  async createRegistration(eventId: string, participantId: string): Promise<Registration> {
    const registration: Registration = {
      id: randomUUID(),
      eventId,
      participantId,
      createdAt: new Date(),
    };
    this.registrations.set(registration.id, registration);
    return { ...registration };
  }
}
