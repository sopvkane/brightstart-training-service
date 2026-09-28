export const maximumDocumentUploadSizeBytes = 5 * 1024 * 1024;

export type DocumentUploadReceipt = {
  uploadId: string;
  fileName: string;
  contentType: 'image/jpeg' | 'image/png';
  size: number;
};
