import { randomUUID } from 'node:crypto';

export interface RequestWithId {
  requestId?: string;
  originalUrl: string;
  header(name: string): string | undefined;
}

interface ResponseWithHeaders {
  setHeader(name: string, value: string): void;
}

export function requestIdMiddleware(
  request: RequestWithId,
  response: ResponseWithHeaders,
  next: () => void,
): void {
  const incomingId = request.header('x-request-id');
  request.requestId = incomingId && /^[A-Za-z0-9._:-]{1,128}$/.test(incomingId)
    ? incomingId
    : randomUUID();
  response.setHeader('X-Request-Id', request.requestId);
  next();
}
