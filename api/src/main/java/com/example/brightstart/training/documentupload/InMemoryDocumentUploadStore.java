package com.example.brightstart.training.documentupload;

import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Component;

@Component
public class InMemoryDocumentUploadStore implements DocumentUploadStore {

    private final Map<String, StoredDocumentUpload> uploads = new ConcurrentHashMap<>();

    @Override
    public void save(StoredDocumentUpload upload) {
        uploads.put(upload.uploadId(), upload);
    }

    @Override
    public Optional<StoredDocumentUpload> find(String uploadId) {
        return Optional.ofNullable(uploads.get(uploadId));
    }
}
