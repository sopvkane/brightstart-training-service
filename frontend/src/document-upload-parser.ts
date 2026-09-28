import type { RequestHandler } from 'express';
import multer from 'multer';

import { maximumDocumentUploadSizeBytes } from './domain/document-upload.js';

export type DocumentUploadParsingError = 'file-too-large' | 'too-many-files' | 'invalid-multipart';

declare global {
  namespace Express {
    interface Request {
      documentUploadParsingError?: DocumentUploadParsingError;
    }
  }
}

const parseDocumentImage = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: maximumDocumentUploadSizeBytes,
    files: 1,
  },
}).single('document');

export const parseDocumentUpload: RequestHandler = (request, response, next) => {
  parseDocumentImage(request, response, (error: unknown) => {
    if (error === undefined) {
      next();
      return;
    }

    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        request.documentUploadParsingError = 'file-too-large';
      } else if (error.code === 'LIMIT_FILE_COUNT' || error.code === 'LIMIT_UNEXPECTED_FILE') {
        request.documentUploadParsingError = 'too-many-files';
      } else {
        request.documentUploadParsingError = 'invalid-multipart';
      }

      next();
      return;
    }

    next(error);
  });
};
