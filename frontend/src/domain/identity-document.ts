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

const alternateGuidance = {
  passport: {
    heading: 'Take a clear image of your passport',
    introduction: 'Use the photo and details page of your passport for this training journey.',
    requirements: ['Place the passport on a flat surface', 'Keep all four page corners visible'],
  },
  'driving-licence': {
    heading: 'Take a clear image of your driving licence',
    introduction: 'Use the front of your driving licence for this training journey.',
    requirements: ['Place the card on a flat surface', 'Keep all four card corners visible'],
  },
  'national-identity-card': {
    heading: 'Take a clear image of your national identity card',
    introduction: 'Use the front of your identity card for this training journey.',
    requirements: ['Place the card on a flat surface', 'Keep all four card corners visible'],
  },
} as const satisfies Record<IdentityDocumentType, IdentityDocumentDetails['guidance']>;

export function getIdentityDocumentDetails(
  documentType: IdentityDocumentType,
  useAlternateGuidance: boolean,
): IdentityDocumentDetails {
  const details = identityDocumentDetails[documentType];
  return {
    label: details.label,
    guidance: useAlternateGuidance ? alternateGuidance[documentType] : details.guidance,
  };
}

export function isIdentityDocumentType(value: string): value is IdentityDocumentType {
  return Object.hasOwn(identityDocumentDetails, value);
}
