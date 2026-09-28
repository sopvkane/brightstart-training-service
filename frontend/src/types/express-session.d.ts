import 'express-session';

import type { JourneyState } from '../domain/journey.js';

declare module 'express-session' {
  interface SessionData {
    csrfToken?: string;
    journey?: JourneyState;
  }
}
