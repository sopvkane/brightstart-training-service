package com.example.brightstart.training.documentupload;

import java.util.Arrays;
import java.util.Optional;

public enum IdentityDocumentType {
    PASSPORT("passport"),
    DRIVING_LICENCE("driving-licence"),
    NATIONAL_IDENTITY_CARD("national-identity-card");

    private final String value;

    IdentityDocumentType(String value) {
        this.value = value;
    }

    public static Optional<IdentityDocumentType> fromValue(String submittedValue) {
        return Arrays.stream(values()).filter(type -> type.value.equals(submittedValue)).findFirst();
    }
}
