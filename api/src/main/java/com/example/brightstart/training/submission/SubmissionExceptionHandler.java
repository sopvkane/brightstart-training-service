package com.example.brightstart.training.submission;

import org.springframework.http.ProblemDetail;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class SubmissionExceptionHandler {

    @ExceptionHandler(SubmissionException.class)
    public ProblemDetail handleSubmissionException(SubmissionException exception) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(
                exception.getStatus(), exception.getMessage());
        problem.setTitle(exception.getTitle());
        return problem;
    }
}
