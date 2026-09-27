package com.example.brightstart.training.address;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.SERVICE_UNAVAILABLE)
public class AddressLookupUnavailableException extends RuntimeException {

    public AddressLookupUnavailableException() {
        super("The synthetic address lookup is deliberately unavailable for this postcode.");
    }
}
