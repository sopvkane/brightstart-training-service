package com.example.brightstart.training.documentupload;

import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

@RestControllerAdvice
public class DocumentUploadExceptionHandler {

    @ExceptionHandler(DocumentUploadException.class)
    public ProblemDetail handleDocumentUploadException(DocumentUploadException exception) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(
                exception.getStatus(), exception.getMessage());
        problem.setTitle(exception.getTitle());
        return problem;
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ProblemDetail handleMaximumUploadSizeExceeded() {
        DocumentUploadException exception = DocumentUploadService.fileTooLarge();
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(
                HttpStatus.CONTENT_TOO_LARGE, exception.getMessage());
        problem.setTitle(exception.getTitle());
        return problem;
    }
}
