import { AsyncLocalStorage } from 'node:async_hooks';
import { randomUUID } from 'node:crypto';

import type { RequestHandler } from 'express';

export const requestIdHeader = 'X-Request-Id';

const requestIdPattern = /^[A-Za-z0-9_-]{1,64}$/;
const requestStorage = new AsyncLocalStorage<{ requestId: string }>();

export function isValidRequestId(value: string | undefined): value is string {
  return value !== undefined && requestIdPattern.test(value);
}

export function createRequestId(incomingValue?: string): string {
  return isValidRequestId(incomingValue) ? incomingValue : randomUUID();
}

export function currentRequestId(): string | undefined {
  return requestStorage.getStore()?.requestId;
}

export function runWithRequestId<T>(requestId: string, work: () => T): T {
  return requestStorage.run({ requestId }, work);
}

export function createRequestContextMiddleware(
  writeLog: (message: string) => void = console.info,
): RequestHandler {
  return (request, response, next) => {
    const requestId = createRequestId(request.get(requestIdHeader));
    const startedAt = performance.now();

    response.set(requestIdHeader, requestId);
    response.once('finish', () => {
      const durationMs = Math.round(performance.now() - startedAt);
      writeLog(
        `requestId=${requestId} method=${request.method} path=${request.path} status=${response.statusCode} durationMs=${durationMs}`,
      );
    });

    runWithRequestId(requestId, next);
  };
}

export function requestIdHeaders(): Record<string, string> {
  const requestId = currentRequestId();
  return requestId === undefined ? {} : { [requestIdHeader]: requestId };
}
