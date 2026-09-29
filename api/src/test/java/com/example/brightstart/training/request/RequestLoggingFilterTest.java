package com.example.brightstart.training.request;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class RequestLoggingFilterTest {

    @Test
    void preservesAValidIncomingRequestId() {
        assertThat(RequestLoggingFilter.requestId("training-request-123"))
                .isEqualTo("training-request-123");
    }

    @Test
    void replacesAnUnsafeIncomingRequestId() {
        assertThat(RequestLoggingFilter.requestId("unsafe request with spaces"))
                .matches("[a-f0-9-]{36}")
                .isNotEqualTo("unsafe request with spaces");
    }
}
