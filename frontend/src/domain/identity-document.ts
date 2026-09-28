type IdentityDocumentDetails = {
  label: string;
  guidance: {
    heading: string;
    introduction: string;
    requirements: readonly string[];
  };
};

export const identityDocumentDetails = {
  passport: {
    label: 'Passport',
    guidance: {
      heading: 'Get your passport ready',
      introduction:
        'You will later need a clear image of the photo and details page of your passport.',
      requirements: [
        'The full page is visible',
        'The details can be read clearly',
        'There is no significant glare',
        'The image is not blurred',
      ],
    },
  },
  'driving-licence': {
    label: 'Driving licence',
    guidance: {
      heading: 'Get your driving licence ready',
      introduction: 'You will later need a clear image of the front of your driving licence.',
      requirements: [
        'The whole card is visible',
        'The image and text are clear',
        'There is no significant glare',
        'The image is not blurred',
      ],
    },
  },
  'national-identity-card': {
    label: 'National identity card',
    guidance: {
      heading: 'Get your national identity card ready',
      introduction: 'You will later need a clear image of the front of your identity card.',
      requirements: [
        'The whole card is visible',
        'The details can be read',
        'There is no significant glare',
        'The image is not blurred',
      ],
    },
  },
} as const satisfies Record<string, IdentityDocumentDetails>;

export type IdentityDocumentType = keyof typeof identityDocumentDetails;

export function isIdentityDocumentType(value: string): value is IdentityDocumentType {
  return Object.hasOwn(identityDocumentDetails, value);
}
