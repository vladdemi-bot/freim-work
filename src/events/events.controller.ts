import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Res,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiExtraModels,
  ApiBody,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { ApiErrorDto } from '../common/api-error.dto';
import { ApiProblemResponse } from '../common/api-problem-response.decorator';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import {
  createEventSchema,
  createRegistrationSchema,
  eventIdSchema,
  updateEventSchema,
} from './event.schemas';
import { Category, Event, Registration } from './event';
import {
  CategoryResponseDto,
  CreateEventDto,
  CreateRegistrationDto,
  EventResponseDto,
  RegistrationResponseDto,
  UpdateEventDto,
} from './event.dto';
import { EventsService } from './events.service';

interface LocationResponse {
  setHeader(name: string, value: string): void;
}

@Controller()
@ApiTags('CampusHub Events')
@ApiExtraModels(
  ApiErrorDto,
  CreateEventDto,
  UpdateEventDto,
  CreateRegistrationDto,
  EventResponseDto,
  CategoryResponseDto,
  RegistrationResponseDto,
)
export class EventsController {
  constructor(private readonly events: EventsService) {}

  @Get('categories')
  @ApiOperation({ summary: 'List event categories' })
  @ApiOkResponse({ description: 'Seeded event categories.', type: CategoryResponseDto, isArray: true })
  @ApiProblemResponse(500, 'Unexpected server error.')
  findCategories(): Promise<Category[]> {
    return this.events.findCategories();
  }

  @Post('events')
  @ApiOperation({ summary: 'Create an event' })
  @ApiBody({
    type: CreateEventDto,
    examples: {
      workshop: { summary: 'Create a workshop', value: { title: 'Node.js Workshop', description: 'Introductory campus workshop.', categoryId: '11111111-1111-4111-8111-111111111111' } },
    },
  })
  @ApiCreatedResponse({
    description: 'Event created. The Location header identifies the new resource.',
    headers: { Location: { description: 'URI of the created event.', schema: { type: 'string', example: '/events/550e8400-e29b-41d4-a716-446655440000' } } },
    type: EventResponseDto,
  })
  @ApiProblemResponse(400, 'Invalid event data or categoryId.')
  @ApiProblemResponse(500, 'Unexpected server error.')
  async create(
    @Body(new ZodValidationPipe(createEventSchema)) body: CreateEventDto,
    @Res({ passthrough: true }) response: LocationResponse,
  ): Promise<Event> {
    const event = await this.events.create(body);
    response.setHeader('Location', `/events/${event.id}`);
    return event;
  }

  @Get('events')
  @ApiOperation({ summary: 'List events' })
  @ApiOkResponse({ description: 'All events.', type: EventResponseDto, isArray: true })
  @ApiProblemResponse(500, 'Unexpected server error.')
  findAll(): Promise<Event[]> {
    return this.events.findAll();
  }

  @Get('events/:id')
  @ApiOperation({ summary: 'Get an event by UUID' })
  @ApiParam({ name: 'id', format: 'uuid', description: 'Event UUID.' })
  @ApiOkResponse({ description: 'The requested event.', type: EventResponseDto })
  @ApiProblemResponse(400, 'The id must be a UUID.')
  @ApiProblemResponse(404, 'Event not found.')
  @ApiProblemResponse(500, 'Unexpected server error.')
  findOne(
    @Param('id', new ZodValidationPipe(eventIdSchema, 'id')) id: string,
  ): Promise<Event> {
    return this.events.findOne(id);
  }

  @Patch('events/:id')
  @ApiOperation({ summary: 'Update selected event fields' })
  @ApiParam({ name: 'id', format: 'uuid', description: 'Event UUID.' })
  @ApiBody({
    type: UpdateEventDto,
    examples: { rename: { summary: 'Change event title', value: { title: 'Advanced Node.js Workshop' } } },
  })
  @ApiOkResponse({ description: 'Updated event.', type: EventResponseDto })
  @ApiProblemResponse(400, 'Invalid patch body, id, or categoryId.')
  @ApiProblemResponse(404, 'Event not found.')
  @ApiProblemResponse(500, 'Unexpected server error.')
  update(
    @Param('id', new ZodValidationPipe(eventIdSchema, 'id')) id: string,
    @Body(new ZodValidationPipe(updateEventSchema)) body: UpdateEventDto,
  ): Promise<Event> {
    return this.events.update(id, body);
  }

  @Delete('events/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an event and its registrations' })
  @ApiParam({ name: 'id', format: 'uuid', description: 'Event UUID.' })
  @ApiNoContentResponse({ description: 'Event and all related registrations deleted. Response has no body.' })
  @ApiProblemResponse(400, 'The id must be a UUID.')
  @ApiProblemResponse(404, 'Event not found.')
  @ApiProblemResponse(500, 'Unexpected server error.')
  async remove(
    @Param('id', new ZodValidationPipe(eventIdSchema, 'id')) id: string,
  ): Promise<void> {
    await this.events.remove(id);
  }

  @Post('events/:id/registrations')
  @ApiOperation({ summary: 'Register a participant for an event' })
  @ApiParam({ name: 'id', format: 'uuid', description: 'Event UUID.' })
  @ApiCreatedResponse({
    description: 'Registration created. The Location header identifies the registration resource.',
    headers: { Location: { description: 'URI of the created registration.', schema: { type: 'string', example: '/events/550e8400-e29b-41d4-a716-446655440000/registrations/33333333-3333-4333-8333-333333333333' } } },
    type: RegistrationResponseDto,
  })
  @ApiProblemResponse(400, 'The id or participantId is invalid.')
  @ApiProblemResponse(404, 'Event not found.')
  @ApiProblemResponse(409, 'Participant is already registered for this event.')
  @ApiProblemResponse(500, 'Unexpected server error.')
  async register(
    @Param('id', new ZodValidationPipe(eventIdSchema, 'id')) eventId: string,
    @Body(new ZodValidationPipe(createRegistrationSchema)) body: CreateRegistrationDto,
    @Res({ passthrough: true }) response: LocationResponse,
  ): Promise<Registration> {
    const registration = await this.events.register(
      eventId,
      body.participantId,
    );
    response.setHeader(
      'Location',
      `/events/${eventId}/registrations/${registration.id}`,
    );
    return registration;
  }
}
