package com.example.brightstart.training.documentupload;

import java.util.Optional;

public interface DocumentUploadStore {

    void save(StoredDocumentUpload upload);

    Optional<StoredDocumentUpload> find(String uploadId);
}
