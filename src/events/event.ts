export interface Event {
  id: string;
  title: string;
  description?: string;
  categoryId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: string;
  name: string;
}

export interface Registration {
  id: string;
  eventId: string;
  participantId: string;
  createdAt: Date;
}

export type CreateEventInput = Pick<Event, 'title' | 'categoryId'> &
  Partial<Pick<Event, 'description'>>;
export type UpdateEventInput = Partial<CreateEventInput>;
export type CreateRegistrationInput = Pick<Registration, 'eventId' | 'participantId'>;
