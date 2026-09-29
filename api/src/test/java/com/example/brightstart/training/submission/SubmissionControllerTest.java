package com.example.brightstart.training.submission;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import com.example.brightstart.training.documentupload.DocumentUploadStore;
import com.example.brightstart.training.documentupload.IdentityDocumentType;
import com.example.brightstart.training.documentupload.InMemoryDocumentUploadStore;
import com.example.brightstart.training.documentupload.StoredDocumentUpload;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(SubmissionController.class)
@Import({
    SubmissionService.class,
    SubmissionDecisionService.class,
    SubmissionExceptionHandler.class,
    InMemoryDocumentUploadStore.class
})
class SubmissionControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private DocumentUploadStore uploadStore;

    @BeforeEach
    void storeAcceptedUpload() {
        uploadStore.save(new StoredDocumentUpload(
                "upload-123",
                IdentityDocumentType.PASSPORT,
                "training.jpg",
                "image/jpeg",
                new byte[] {(byte) 0xFF, (byte) 0xD8, (byte) 0xFF}));
    }

    @Test
    void acceptsACompleteSubmissionAndReturnsTheDeterministicDecision() throws Exception {
        mockMvc.perform(post("/api/submissions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validSubmission("passport", "upload-123")))
                .andExpect(status().isCreated())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.submissionId").value(org.hamcrest.Matchers.startsWith("BST-")))
                .andExpect(jsonPath("$.decision").value("ACCEPTED"));
    }

    @Test
    void rejectsAMalformedSubmission() throws Exception {
        mockMvc.perform(post("/api/submissions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isBadRequest())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_PROBLEM_JSON))
                .andExpect(jsonPath("$.title").value("Invalid submission"));
    }

    @Test
    void rejectsAnUnsupportedIdentityDocument() throws Exception {
        mockMvc.perform(post("/api/submissions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validSubmission("library-card", "upload-123")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.title").value("Invalid submission"));
    }

    @Test
    void reportsAnUnknownUploadReference() throws Exception {
        mockMvc.perform(post("/api/submissions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validSubmission("passport", "unknown")))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.title").value("Document upload not found"));
    }

    @Test
    void rejectsAnUploadForADifferentDocumentType() throws Exception {
        mockMvc.perform(post("/api/submissions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validSubmission("driving-licence", "upload-123")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.title").value("Invalid submission"));
    }

    private String validSubmission(String documentType, String uploadId) {
        return """
                {
                  "address": {
                    "id": "bt9-7ep-1",
                    "line1": "1 Apprentice Avenue",
                    "line2": "Learning Quarter",
                    "town": "Belfast",
                    "postcode": "BT9 7EP"
                  },
                  "identityDocument": "%s",
                  "documentUploadId": "%s"
                }
                """.formatted(documentType, uploadId);
    }
}
