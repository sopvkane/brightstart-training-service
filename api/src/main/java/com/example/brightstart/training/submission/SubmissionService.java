package com.example.brightstart.training.submission;

import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import com.example.brightstart.training.documentupload.DocumentUploadStore;
import com.example.brightstart.training.documentupload.IdentityDocumentType;
import com.example.brightstart.training.documentupload.StoredDocumentUpload;

@Service
public class SubmissionService {

    private final DocumentUploadStore uploadStore;
    private final SubmissionDecisionService decisionService;

    public SubmissionService(
            DocumentUploadStore uploadStore,
            SubmissionDecisionService decisionService) {
        this.uploadStore = uploadStore;
        this.decisionService = decisionService;
    }

    public SubmissionResult submit(SubmissionRequest request) {
        if (request == null || !isComplete(request.address()) || isBlank(request.documentUploadId())) {
            throw invalidSubmission();
        }

        IdentityDocumentType documentType = IdentityDocumentType.fromValue(request.identityDocument())
                .orElseThrow(SubmissionService::invalidSubmission);
        StoredDocumentUpload upload = uploadStore.find(request.documentUploadId())
                .orElseThrow(() -> new SubmissionException(
                        HttpStatus.NOT_FOUND,
                        "Document upload not found",
                        "The referenced document upload could not be found."));

        if (upload.documentType() != documentType) {
            throw invalidSubmission();
        }

        return new SubmissionResult(
                "BST-" + UUID.randomUUID().toString().toUpperCase(),
                decisionService.decide());
    }

    private boolean isComplete(SubmissionAddress address) {
        return address != null
                && !isBlank(address.id())
                && !isBlank(address.line1())
                && address.line2() != null
                && !isBlank(address.town())
                && !isBlank(address.postcode());
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    private static SubmissionException invalidSubmission() {
        return new SubmissionException(
                HttpStatus.BAD_REQUEST,
                "Invalid submission",
                "Provide a complete address, supported identity document and accepted upload.");
    }
}
