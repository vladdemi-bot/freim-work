import { Category, CreateEventInput, Event, Registration, UpdateEventInput } from './event';

export interface EventsRepository {
  findAllCategories(): Promise<Category[]>;
  categoryExists(id: string): Promise<boolean>;
  createEvent(input: CreateEventInput): Promise<Event>;
  findAllEvents(): Promise<Event[]>;
  findEvent(id: string): Promise<Event | null>;
  updateEvent(id: string, input: UpdateEventInput): Promise<Event | null>;
  deleteEvent(id: string): Promise<boolean>;
  findRegistration(eventId: string, participantId: string): Promise<Registration | null>;
  createRegistration(eventId: string, participantId: string): Promise<Registration>;
}

export const EVENTS_REPOSITORY = Symbol('EVENTS_REPOSITORY');
