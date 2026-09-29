package com.example.brightstart.training.submission;

import org.springframework.http.HttpStatus;

public class SubmissionException extends RuntimeException {

    private final HttpStatus status;
    private final String title;

    public SubmissionException(HttpStatus status, String title, String publicMessage) {
        super(publicMessage);
        this.status = status;
        this.title = title;
    }

    public HttpStatus getStatus() {
        return status;
    }

    public String getTitle() {
        return title;
    }
}
