export const identityDocumentLabels = {
  passport: 'Passport',
  'driving-licence': 'Driving licence',
  'national-identity-card': 'National identity card',
} as const;

export type IdentityDocumentType = keyof typeof identityDocumentLabels;

export function isIdentityDocumentType(value: string): value is IdentityDocumentType {
  return Object.hasOwn(identityDocumentLabels, value);
}
