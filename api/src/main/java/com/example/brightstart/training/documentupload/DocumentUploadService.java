package com.example.brightstart.training.documentupload;

import java.io.IOException;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class DocumentUploadService {

    public static final long MAXIMUM_FILE_SIZE_BYTES = 5L * 1024 * 1024;

    private static final byte[] PNG_SIGNATURE = {
        (byte) 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A
    };

    private final DocumentUploadStore uploadStore;

    public DocumentUploadService(DocumentUploadStore uploadStore) {
        this.uploadStore = uploadStore;
    }

    public DocumentUploadReceipt acceptUpload(String documentType, MultipartFile document) {
        IdentityDocumentType supportedDocumentType = IdentityDocumentType.fromValue(documentType)
                .orElseThrow(() -> new DocumentUploadException(
                        HttpStatus.BAD_REQUEST,
                        "Invalid identity document type",
                        "Select a supported identity document before uploading an image."));

        if (document == null || document.isEmpty()) {
            throw new DocumentUploadException(
                    HttpStatus.BAD_REQUEST,
                    "Document image required",
                    "Select a non-empty document image to upload.");
        }

        if (document.getSize() > MAXIMUM_FILE_SIZE_BYTES) {
            throw fileTooLarge();
        }

        byte[] content = readContent(document);
        String contentType = detectContentType(content);
        String uploadId = UUID.randomUUID().toString();
        String fileName = displayFileName(document.getOriginalFilename());

        uploadStore.save(new StoredDocumentUpload(
                uploadId, supportedDocumentType, fileName, contentType, content));

        return new DocumentUploadReceipt(
                uploadId,
                fileName,
                contentType,
                document.getSize());
    }

    public StoredDocumentUpload findUpload(String uploadId) {
        return uploadStore.find(uploadId).orElseThrow(() -> new DocumentUploadException(
                HttpStatus.NOT_FOUND,
                "Document upload not found",
                "The document upload could not be found."));
    }

    private byte[] readContent(MultipartFile document) {
        try {
            return document.getBytes();
        } catch (IOException exception) {
            throw new DocumentUploadException(
                    HttpStatus.SERVICE_UNAVAILABLE,
                    "Document upload unavailable",
                    "The document image could not be read. Try again later.");
        }
    }

    private String detectContentType(byte[] content) {
        if (isJpeg(content)) {
            return "image/jpeg";
        }

        if (startsWith(content, PNG_SIGNATURE)) {
            return "image/png";
        }

        throw new DocumentUploadException(
                HttpStatus.UNSUPPORTED_MEDIA_TYPE,
                "Unsupported document image",
                "Upload a JPEG or PNG document image.");
    }

    private boolean isJpeg(byte[] content) {
        return content.length >= 3
                && content[0] == (byte) 0xFF
                && content[1] == (byte) 0xD8
                && content[2] == (byte) 0xFF;
    }

    private boolean startsWith(byte[] content, byte[] signature) {
        if (content.length < signature.length) {
            return false;
        }

        for (int index = 0; index < signature.length; index++) {
            if (content[index] != signature[index]) {
                return false;
            }
        }

        return true;
    }

    private String displayFileName(String submittedFileName) {
        if (submittedFileName == null || submittedFileName.isBlank()) {
            return "uploaded-image";
        }

        String normalisedSeparators = submittedFileName.replace('\\', '/');
        String finalSegment = normalisedSeparators.substring(normalisedSeparators.lastIndexOf('/') + 1);

        return finalSegment.isBlank() ? "uploaded-image" : finalSegment;
    }

    public static DocumentUploadException fileTooLarge() {
        return new DocumentUploadException(
                HttpStatus.CONTENT_TOO_LARGE,
                "Document image too large",
                "The document image must be 5 MB or smaller.");
    }
}
