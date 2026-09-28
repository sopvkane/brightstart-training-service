import 'express-session';

import type { Address } from '../domain/address.js';

type JourneyState = {
  postcode: string;
  selectedAddress?: Address;
};

declare module 'express-session' {
  interface SessionData {
    csrfToken?: string;
    journey?: JourneyState;
  }
}
