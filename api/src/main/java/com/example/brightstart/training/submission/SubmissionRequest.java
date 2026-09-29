package com.example.brightstart.training.submission;

public record SubmissionRequest(
        SubmissionAddress address,
        String identityDocument,
        String documentUploadId) {}
