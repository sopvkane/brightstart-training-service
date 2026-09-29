package com.example.brightstart.training.documentupload;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class InMemoryDocumentUploadStoreTest {

    @Test
    void storesAndRetrievesValidatedUploadData() {
        InMemoryDocumentUploadStore store = new InMemoryDocumentUploadStore();
        byte[] content = {(byte) 0xFF, (byte) 0xD8, (byte) 0xFF};
        StoredDocumentUpload upload = new StoredDocumentUpload(
                "upload-123",
                IdentityDocumentType.PASSPORT,
                "training.jpg",
                "image/jpeg",
                content);

        store.save(upload);
        content[0] = 0;

        assertThat(store.find("upload-123")).contains(upload);
        assertThat(store.find("upload-123").orElseThrow().content())
                .containsExactly((byte) 0xFF, (byte) 0xD8, (byte) 0xFF);
        assertThat(store.find("unknown")).isEmpty();
    }
}
