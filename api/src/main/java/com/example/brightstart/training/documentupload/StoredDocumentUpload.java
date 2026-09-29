package com.example.brightstart.training.documentupload;

public record StoredDocumentUpload(
        String uploadId,
        IdentityDocumentType documentType,
        String fileName,
        String contentType,
        byte[] content) {

    public StoredDocumentUpload {
        content = content.clone();
    }

    @Override
    public byte[] content() {
        return content.clone();
    }
}
