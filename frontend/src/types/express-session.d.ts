import 'express-session';

import type { Address } from '../address-api-client.js';

declare module 'express-session' {
  interface SessionData {
    csrfToken?: string;
    postcode?: string;
    selectedAddress?: Address;
  }
}
