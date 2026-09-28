package com.example.brightstart.training.documentupload;

import java.util.Arrays;

public enum IdentityDocumentType {
    PASSPORT("passport"),
    DRIVING_LICENCE("driving-licence"),
    NATIONAL_IDENTITY_CARD("national-identity-card");

    private final String value;

    IdentityDocumentType(String value) {
        this.value = value;
    }

    public static boolean supports(String submittedValue) {
        return Arrays.stream(values()).anyMatch(type -> type.value.equals(submittedValue));
    }
}
