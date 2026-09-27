import 'express-session';

import type { Address } from '../address-api-client.js';

declare module 'express-session' {
  interface SessionData {
    postcode?: string;
    selectedAddress?: Address;
  }
}
