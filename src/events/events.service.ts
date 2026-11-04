import { Inject, Injectable } from '@nestjs/common';
import { ApiException } from '../common/api-exception';
import {
  Category,
  CreateEventInput,
  Event,
  Registration,
  UpdateEventInput,
} from './event';
import { EVENTS_REPOSITORY, EventsRepository } from './events.repository';

@Injectable()
export class EventsService {
  constructor(
    @Inject(EVENTS_REPOSITORY) private readonly repository: EventsRepository,
  ) {}

  findCategories(): Promise<Category[]> {
    return this.repository.findAllCategories();
  }

  async create(input: CreateEventInput): Promise<Event> {
    await this.assertCategory(input.categoryId);
    return this.repository.createEvent(input);
  }

  findAll(): Promise<Event[]> {
    return this.repository.findAllEvents();
  }

  async findOne(id: string): Promise<Event> {
    const event = await this.repository.findEvent(id);
    if (!event) throw this.eventNotFound(id);
    return event;
  }

  async update(id: string, input: UpdateEventInput): Promise<Event> {
    await this.findOne(id);
    if (input.categoryId) await this.assertCategory(input.categoryId);
    const event = await this.repository.updateEvent(id, input);
    if (!event) throw this.eventNotFound(id);
    return event;
  }

  async remove(id: string): Promise<void> {
    const removed = await this.repository.deleteEvent(id);
    if (!removed) throw this.eventNotFound(id);
  }

  async register(eventId: string, participantId: string): Promise<Registration> {
    await this.findOne(eventId);
    const existing = await this.repository.findRegistration(eventId, participantId);
    if (existing) {
      throw new ApiException(
        'REGISTRATION_ALREADY_EXISTS',
        'Participant is already registered for this event',
        409,
      );
    }
    return this.repository.createRegistration(eventId, participantId);
  }

  private async assertCategory(categoryId: string): Promise<void> {
    if (!(await this.repository.categoryExists(categoryId))) {
      throw new ApiException(
        'CATEGORY_NOT_FOUND',
        `Category with id ${categoryId} was not found`,
        400,
      );
    }
  }

  private eventNotFound(id: string): ApiException {
    return new ApiException('EVENT_NOT_FOUND', `Event with id ${id} was not found`, 404);
  }
}
