import type { Submission, SubmissionResult } from './domain/submission.js';
import { requestIdHeaders } from './request-context.js';

const defaultApiBaseUrl = 'http://localhost:8080';
const defaultRequestTimeoutMilliseconds = 5_000;

export type SubmissionApiClient = {
  submit(submission: Submission): Promise<SubmissionResult>;
};

export class SubmissionApiError extends Error {
  public constructor(message: string, cause?: unknown) {
    super(message, { cause });
    this.name = 'SubmissionApiError';
  }
}

function toSubmissionResult(value: unknown): SubmissionResult | undefined {
  if (
    typeof value === 'object' &&
    value !== null &&
    'submissionId' in value &&
    typeof value.submissionId === 'string' &&
    value.submissionId.length > 0 &&
    'decision' in value &&
    value.decision === 'ACCEPTED'
  ) {
    return { submissionId: value.submissionId, decision: value.decision };
  }

  return undefined;
}

export function createSubmissionApiClient(
  apiBaseUrl = defaultApiBaseUrl,
  requestTimeoutMilliseconds = defaultRequestTimeoutMilliseconds,
): SubmissionApiClient {
  return {
    async submit(submission) {
      let response: Response;

      try {
        response = await fetch(new URL('/api/submissions', apiBaseUrl), {
          method: 'POST',
          headers: {
            accept: 'application/json',
            'content-type': 'application/json',
            ...requestIdHeaders(),
          },
          body: JSON.stringify(submission),
          signal: AbortSignal.timeout(requestTimeoutMilliseconds),
        });
      } catch (error) {
        throw new SubmissionApiError('The submission API request could not be completed.', error);
      }

      if (!response.ok) {
        throw new SubmissionApiError(`The submission API returned HTTP ${response.status}.`);
      }

      let responseBody: unknown;

      try {
        responseBody = await response.json();
      } catch (error) {
        throw new SubmissionApiError('The submission API did not return valid JSON.', error);
      }

      const result = toSubmissionResult(responseBody);

      if (result === undefined) {
        throw new SubmissionApiError('The submission API returned an unexpected response.');
      }

      return result;
    },
  };
}
