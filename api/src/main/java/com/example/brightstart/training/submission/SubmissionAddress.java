package com.example.brightstart.training.submission;

public record SubmissionAddress(
        String id,
        String line1,
        String line2,
        String town,
        String postcode) {}
