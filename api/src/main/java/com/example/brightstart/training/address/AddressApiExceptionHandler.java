package com.example.brightstart.training.address;

import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class AddressApiExceptionHandler {

    @ExceptionHandler(AddressLookupUnavailableException.class)
    public ProblemDetail handleAddressLookupUnavailable() {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(
                HttpStatus.SERVICE_UNAVAILABLE,
                "Address lookup is temporarily unavailable. Try again later.");
        problem.setTitle("Address lookup unavailable");
        return problem;
    }
}
