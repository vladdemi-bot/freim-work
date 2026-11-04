import { Module } from '@nestjs/common';
import { EVENTS_REPOSITORY } from './events.repository';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { InMemoryEventsRepository } from './in-memory-events.repository';

@Module({
  controllers: [EventsController],
  providers: [
    EventsService,
    InMemoryEventsRepository,
    { provide: EVENTS_REPOSITORY, useExisting: InMemoryEventsRepository },
  ],
  exports: [EventsService],
})
export class EventsModule {}
